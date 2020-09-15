#!/usr/bin/env groovy

def errorMessage = 'Foo error'

static java.lang.String getImageVersion(branchName, envBranchName, buildNumber, packageConfig) {

    def version = packageConfig['version']

    if (branchName == envBranchName) {
        return version
    } else {
        return buildNumber
    }
}

pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
    }

    stages {


        stage('Extend an environment') {

            steps {

                script {
                    def props = readProperties file: '.env'
                    env.registryHost = props.registryHost
                    env.registryCredential = props.registryCredential
                    env.registry = props.registry

                    env.kubernetesNamespace = props.kubernetesNamespace
                    env.kubernetesCredentialsId = props.kubernetesCredentialsId
                    env.kubernetesAuthToken = props.kubernetesAuthToken
                    env.kubernetesContainerName = props.kubernetesContainerName
                    env.kubernetesDeployment = props.kubernetesDeployment

                    env.slackChannel = props.slackChannel

                    env.gitLabPrivateTokenName = props.gitLabPrivateTokenName
                    env.gitLabProjectId = props.gitLabProjectId

                    env.devBranch = props.devBranch
                    env.masterBranch = props.masterBranch


                    packageConfig = readJSON file: 'package.json'
                    version = getImageVersion(env.BRANCH_NAME, env.masterBranch, env.BUILD_NUMBER, packageConfig)

                    slackSend channel: slackChannel, color: 'good', message: "Start a building $JOB_NAME"
                }
            }
        }

        stage('Check Release Tag') {
            when {
                branch "${env.masterBranch}"
            }
            steps {
                script {

                    withCredentials([string(credentialsId: env.gitLabPrivateTokenName, variable: 'TOKEN')]) {
                        def statusRelease = sh(
                                script: "curl  -o /dev/null -s -w \"%{http_code}\n\" " +
                                        " --header 'Content-Type: application/json' --header \"PRIVATE-TOKEN: ${TOKEN}\" " +
                                        " https://gitlab.com/api/v4/projects/${env.gitLabProjectId}/releases/v${version}",
                                returnStdout: true
                        ).trim()

                        switch (statusRelease) {
                            case '200':
                                errorMessage = "This release $version already exists. Stop the building"
                                error errorMessage
                                break

                            case '401':
                                errorMessage = "Unauthorized to GitLab"
                                error errorMessage
                                break
                        }

                    }


                }
            }
        }


        stage('Images building') {
            steps {
                script {
                    dockerImage = docker.build registry
                }
            }

        }

        stage('Deploy an image for dev env') {
            when {
                branch "${env.devBranch}"
            }
            steps {

                catchError {
                    script {
                        errorMessage = 'Cant set the new image into cluster'
                    }
                }

                script {
                    sh "docker tag $registry $registry/$env.BRANCH_NAME:$version"

                    docker.withRegistry(registryHost, registryCredential) {
                        sh "docker push $registry/$env.BRANCH_NAME:$version"
                    }

                    sh "docker rmi $registry:latest"
                    sh "docker rmi $registry/$env.BRANCH_NAME:$version"

                }
            }
        }

        stage('Deploy an image for prod env') {
            when {
                branch "${env.masterBranch}"
            }
            steps {

                catchError {
                    script {
                        errorMessage = 'Cant set the new image into prod cluster'
                    }
                }

                script {

                    (major, minor, fix) = version.tokenize('.')

                    sh "docker tag $registry $registry/$env.BRANCH_NAME:$major"
                    sh "docker tag $registry $registry/$env.BRANCH_NAME:$major.$minor"
                    sh "docker tag $registry $registry/$env.BRANCH_NAME:$major.$minor.$fix"

                    docker.withRegistry(registryHost, registryCredential) {
                        sh "docker push $registry/$env.BRANCH_NAME:$major"
                        sh "docker push $registry/$env.BRANCH_NAME:$major.$minor"
                        sh "docker push $registry/$env.BRANCH_NAME:$major.$minor.$fix"
                    }

                    sh "docker rmi $registry:latest"

                    sh "docker rmi $registry/$env.BRANCH_NAME:$major"
                    sh "docker rmi $registry/$env.BRANCH_NAME:$major.$minor"
                    sh "docker rmi $registry/$env.BRANCH_NAME:$major.$minor.$fix"

                }


                withCredentials([string(credentialsId: env.gitLabPrivateTokenName, variable: 'TOKEN')]) {
                    script {
                        sh "curl --header 'Content-Type: application/json' --header \"PRIVATE-TOKEN: ${TOKEN}\" " +
                                " --data '{ \"name\": \"Release $version\", \"tag_name\": \"v$version\", \"ref\": \"master\", \"description\": \"Auto release by Jenkins\" }' " +
                                " --request POST https://gitlab.com/api/v4/projects/${env.gitLabProjectId}/releases"
                    }
                }
            }
        }

        stage('Set a new image into K8s cluster') {
            steps {

                script {
                    packageConfig = readJSON file: 'package.json'
                    imageVersion = getImageVersion(env.BRANCH_NAME, env.masterBranch, env.BUILD_NUMBER, packageConfig)
                }


                withKubeConfig([credentialsId: kubernetesCredentialsId, namespace: kubernetesNamespace]) {
                    withCredentials([string(credentialsId: env.kubernetesAuthToken, variable: 'TOKEN')]) {
                        sh "kubectl set image ${kubernetesDeployment} ${kubernetesContainerName}=$registry/$env.BRANCH_NAME:$imageVersion -n ${kubernetesNamespace} --record --token $TOKEN"
                    }
                }
            }
        }
    }


    post {
        success {
            slackSend color: 'good', channel: slackChannel, message: "The pipeline ${currentBuild.fullDisplayName} completed successfully."
        }

        failure {
            slackSend color: '#ff0000', channel: slackChannel, message: "The pipeline ${currentBuild.fullDisplayName} failed with error '${errorMessage}'"
        }
    }
}
