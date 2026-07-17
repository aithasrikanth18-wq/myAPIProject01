pipeline {
    agent any

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['qa', 'uat', 'prod'],
            description: 'Target environment to run the API test suite against'
        )
    }

    environment {
        ENV = "${params.ENVIRONMENT}"
        CI  = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Execute API Tests') {
            steps {
                sh 'npx playwright test'
            }
        }
    }

    post {
        always {
            // Publish the Playwright HTML report.
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports/html-report',
                reportFiles: 'index.html',
                reportName: 'Playwright API Test Report'
            ])

            // Publish JUnit results so Jenkins renders pass/fail trends.
            junit allowEmptyResults: true, testResults: 'reports/junit-results.xml'

            // Archive raw reports/traces for debugging failures.
            archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
        }
    }
}
