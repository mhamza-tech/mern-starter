#!/bin/bash

# Install AWS CLI
curl "https://bootstrap.pypa.io/get-pip.py" -o "get-pip.py"
python get-pip.py
pip install awscli --ignore-installed six

# Install "zip"
apt-get update
apt-get install -y zip
apt-get install -y unzip
apt-get install -y wget
tf_version="terraform_0.12.26_linux_amd64.zip"
tf_bin_folder=tf-bin
wget https://releases.hashicorp.com/terraform/0.12.26/$tf_version
unzip $tf_version -d $tf_bin_folder
mv $tf_bin_folder/terraform /usr/local/bin/
terraform --version

# Zip up everything including node_modules
ts=$(date +%s)
fn="$ts.zip"

echo "Bundling app ..."
zip -r $fn ./dist ./secrets ./static ./package.json ./node_modules > /dev/null 2>&1

BUILD_NUMBER=$(git rev-parse --short HEAD)
echo "Build number (git commit hash) is $BUILD_NUMBER"

echo "Start building infrastructure"
export TF_VAR_env=$ENV
export TF_VAR_aws_access_key=$AWS_ACCESS_KEY_ID
export TF_VAR_aws_secret_key=$AWS_SECRET_ACCESS_KEY
export TF_VAR_build_number=$BUILD_NUMBER
cd terraform/shared
terraform init
terraform apply -auto-approve
cd ..
terraform init
terraform workspace select $ENV
if [ $? != 0 ]; then
  terraform workspace new $ENV
fi
terraform apply -auto-approve

echo "Uploading app bundle to s3 ..."
cd ..
DIST_BUCKET="$NAMESPACE-dist-$AWS_REGION"
EB_DIST_KEY="$ENV-$GQL_APP_NAME/$fn"

aws s3 cp $fn "s3://$DIST_BUCKET/$EB_DIST_KEY"

echo "Creating ElasticBeanstalk Application Version ..."
APPLICATION_NAME="$NAMESPACE-$GQL_APP_NAME"
VERSION_LABEL="$GQL_APP_NAME-$ENV-$ts"
aws elasticbeanstalk create-application-version \
  --application-name $APPLICATION_NAME \
  --version-label $VERSION_LABEL \
  --description "$GQL_APP_NAME-$ENV" \
  --source-bundle S3Bucket=$DIST_BUCKET,S3Key=$EB_DIST_KEY --auto-create-application \
  --region $AWS_REGION

# Update to that version
echo "Updating ElasticBeanstalk Application Version ..."
aws elasticbeanstalk update-environment \
  --application-name $APPLICATION_NAME \
  --environment-name "$NAMESPACE-$ENV-$GQL_APP_NAME" \
  --version-label $VERSION_LABEL \
  --region $AWS_REGION

echo "Done! Deployed version $VERSION_LABEL"

# copy assets from dev to staging to production
# skip copying of avatars from lower environments
echo "Copying assets between S3 buckets..."
if [ -z $AWS_S3_BUCKET_FROM ]
then
  echo "Skipping AWS bucket copy up. Could not find AWS_S3_BUCKET_FROM environment variable"
else
  aws s3 sync "s3://$AWS_S3_BUCKET_FROM" "s3://$AWS_S3_BUCKET_TO" --exclude 'avatar/*'
fi
