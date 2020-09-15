# MS-3 Save date to DB and actualize info

## Run project
Useful commands to run the project
*  Install packages
```shell script
$ npm i
``` 
* Copy .env.dist and set all mandatory variables
```shell script
$ cp .env.dist .env
```

* Run service
  * Dev mode
    ```shell script
    $ npm run dev
    ```
    or
    ```shell script
    $ make up
    ```
    or 
    ```shell script
    $ make dev
    ```

  * Prod mode
     
     Use it for build and run App
    ```shell script
    $ npm run prod
    ```
    or
    ```shell script
    $ make prod
    ```

## Prepare for building and K8s deployment 

* Build app for deploying
```shell script
$ npm run build
```
or
```shell script
$ make build
```

* Build docker images
```shell script
$ make images
```
* Push images to register
```shell script
$ make push
```
* Rescale deployment on K8s
```shell script
$ kubectl scale deployment ms3-save-data --replicas=0 -n anthill --kubeconfig ~/.kube/config_dev
```
