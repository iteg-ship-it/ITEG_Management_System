pipeline {
    agent any
    stages {

        stage('Build & Deploy Backend') {
            // when { expression { env.BUILD_BACKEND == "true" } }
            steps {
                dir('backend') {
                    // sh 'docker build -t iteg-backend .'
                    sh 'docker build --no-cache -t iteg-backend .'
                    sh 'docker stop iteg-backend-container || true'
                    sh 'docker rm iteg-backend-container || true'
                    sh 'docker run -d -p 5001:5000 --name iteg-backend-container iteg-backend'
                }
            }
        }
        stage('Build & Deploy Frontend') {
            // when { expression { env.BUILD_FRONTEND == "true" } }
            steps {
                dir('frontend') {
                    // sh 'docker build -t iteg-frontend .'
                    sh 'docker build --no-cache -t iteg-frontend .'
                    sh 'docker stop iteg-frontend-container || true'
                    sh 'docker rm iteg-frontend-container || true'
                    sh 'docker run -d -p 5002:5002 --name iteg-frontend-container iteg-frontend'
                }
            }
        }    
    }
}
