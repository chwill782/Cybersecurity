pipeline {
    agent {
        label "ec2agent"
    }
    parameters {
        string(name: 'BASE_URL', defaultValue: 'https://dev-ztmesh.cyberight.net', description: 'Frontend Portal URL')
        string(name: 'CLIENT_URL', defaultValue: 'https://dev-clients.cyberight.net', description: 'Client URL for login')
        string(name: 'CLIENT_VERSION', defaultValue: 'dev-latest', description: 'Version of the docker client to test')
    }
    environment {
        CI='true'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh "docker pull repo.cyberight.org:8443/optm/ztclient-tester:${params.CLIENT_VERSION}"
                sh 'rm -rf playwright/.auth'
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        stage('Test') {
            environment {
                BASE_URL = "${params.BASE_URL}"
                CLIENT_URL = "${params.CLIENT_URL}"
                CLIENT_DOCKER_IMAGE = "repo.cyberight.org:8443/optm/ztclient-tester:${params.CLIENT_VERSION}"
                EMAIL_NAME = 'test.owner@optm.test'
                OKTA_USERNAME = 'test.owner@optm.test'
                OKTA_PASSWORD = credentials('integration-test-user-password')
            }
            steps {
                sh('npx playwright test --project=testSetup --workers=1')
            }
        }
    }
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Integration Tests'
            ])
            archiveArtifacts artifacts: 'test-results/**, playwright-report/**, results.xml'
            junit skipPublishingChecks: true, testResults: 'results.xml'
            emailext body: '''${BUILD_LOG_REGEX, regex=".*(?i) failed.*", linesBefore=3, linesAfter=5, showTruncatedLines=false, maxMatches=1}''',
                subject: "Integration Test: ${env.BUILD_ID} | Result: ${currentBuild.result} | Env: ${BASE_URL}| Int Ver: ${INT_VER}",
                to: 'integrationtestalerts@cyberight.com',
                attachLog: true
        }
    }
}
