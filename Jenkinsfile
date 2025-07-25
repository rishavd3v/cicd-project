pipeline{
    agent any

    environment{
        CLOUDFRONT_DIST_ID = 'E3QUCIQNPYARKD'
        REMOTE_HOST = 'ubuntu@3.110.50.177'
    }

    stages{
        
        stage('code'){
            steps{
                echo 'Checking out code...'
                git credentialsId: 'github-token', url: 'https://github.com/rishavd3v/cicd-practice.git', branch: 'master'
                echo 'Code checked out successfully!'
            }
        }

        stage('build backend'){
            steps{
                echo 'Building backend...'
                dir('backend'){
                    sh 'docker build -t node-app .'
                }
            }
        }

        stage('push to dockerhub'){
            steps{
                echo 'Pushing to DockerHub...'
                sh 'docker image tag node-app rishavd3v/node-app:latest'
                script{
                    docker.withRegistry('', 'dockerhub'){
                        docker.image('rishavd3v/node-app').push('latest')
                    }
                }
            }
        }

        stage('deploy to ec2') {
            steps {
                echo 'Deploying to EC2...'
                withCredentials([sshUserPrivateKey(credentialsId:'ec2-ssh', keyFileVariable:'SSH_KEY')]){
                    sh '''
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $REMOTE_HOST "
                            docker pull rishavd3v/node-app:latest
                            docker stop node-app || true &&
                            docker rm node-app || true &&
                            docker run -d -p 3000:3000 --name node-app rishavd3v/node-app:latest
                        "
                    '''
                }
            }
        }

        stage('build frontend'){
            steps{
                echo 'Building frontend...'
                dir('frontend'){
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('upload to s3'){
            steps{
                echo 'Uploading to S3...'
                withCredentials([usernamePassword(credentialsId:'aws-creds',usernameVariable:'AWS_ACCESS_KEY_ID',passwordVariable:'AWS_SECRET_ACCESS_KEY')]){
                    sh 'aws s3 sync ./frontend/dist s3://react-cicd-practice --delete'
                }
            }
        }

        stage('cloudfront invalidation'){
            steps{
                echo 'Invalidating CloudFront cache...'
                withCredentials([usernamePassword(credentialsId:'aws-creds',usernameVariable:'AWS_ACCESS_KEY_ID',passwordVariable:'AWS_SECRET_ACCESS_KEY')]){
                    sh '''
                        aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DIST_ID --paths "/*"
                    '''
                }
            }
        }


    }
}