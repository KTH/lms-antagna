// Read more: https://jenkins.io/doc/book/pipeline/jenkinsfile/
pipeline {
    agent any

    stages {
        stage('Cleanup phase') {
            steps {
                sh 'docker network prune -f'
            }
        }
        stage('Run Evolene') {
            environment {
                COMPOSE_PROJECT_NAME = "${env.BUILD_TAG}"
            }
            steps {
                sh 'BUILD_INFORMATION_OUTPUT_FILE="/config/version.js" SLACK_CHANNELS="#team-e-larande-build,#pipeline-logs" DEBUG=True EXPERIMENTAL=True $EVOLENE_DIRECTORY/run.sh'
            }
        }
        stage('Dump info') {
            steps {
                sh 'docker images'
                sh 'docker network ls'
            }
        }
    }
}
