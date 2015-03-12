# SP-Topics

## Requirements

* npm

* gulp (`npm install -g gulp`)

* composer

* MySql and run the model sql script to create the required table(s).

## Build Distribution

Execute the command `gulp` on your command line and the distribution shall be built on `dist/` folder. The properties
from `properties.json` are taken, so you can update them. Also executing the tasks with `-p` flag implies using
the production setup that is defined also in properties file.

## Deploy

Execute `gulp deploy` and the distribution shall be sent to the local directory set in properties. Also you can
execute  `gulp -p deploy` that sends the distribution via SFTP to a remote machine.

## Usage

Add in the table rows where the url attribute should be an http url with a placeholder `{{word}}` where the replacement
should be made. These urls usually are suggestion or search engines. Also add a parser name that is the name of a function
placed in `api/core/parser.php` file. This parser shall take the http body response and parse it in order to return a 
list of topics.

That's all, deploy the code, link it to database and open `explorer.php`.