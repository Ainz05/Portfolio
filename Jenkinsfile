pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  triggers {
    pollSCM('H/5 * * * *')
  }

  environment {
    IMAGE = 'ghcr.io/ainz05/portfolio'
  }

  stages {
    stage('Préparer') {
      steps {
        script {
          env.TAG = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
        }
        echo "Version : ${env.TAG}"
      }
    }

    stage('Construire l\'image') {
      steps {
        sh 'docker build --provenance=false --sbom=false -t $IMAGE:$TAG -t $IMAGE:latest frontend'
      }
    }

    stage('Envoyer l\'image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'ghcr-push',
            usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
          sh '''
            echo "$GH_TOKEN" | docker login ghcr.io -u "$GH_USER" --password-stdin
            docker push $IMAGE:$TAG
            docker push $IMAGE:latest
          '''
        }
      }
    }

    stage('Déployer') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'deploy-ssh',
            keyFileVariable: 'SSH_KEY')]) {
          dir('ansible') {
            sh 'ansible-playbook -i inventory.ci.ini deploy.yml -e image_tag=$TAG --private-key "$SSH_KEY"'
          }
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout ghcr.io || true'
    }
  }
}