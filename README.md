# VPN account generator
Generates account for a VPN provider, by creating a valid email address, generating credentials and performing email validation. All of this is done in a real browser, using Puppeteer.
## Install
1. Install required dependencies globally
    ```
    npm install -g typescript ts-node mkdirp browserify babel-cli uglify-js rimraf chokidar
    ```
2. Install project dependencies
    ```
    npm install
    ```

3. Build the client and server files
    ```
    npm run build
    ```

## Run
 You first need to build the server and client files. Read the *Install* section for further details  
1. To run the server  
    ```
    npm run start
    ```  
2. Navigate to **http://localhost:5000**
