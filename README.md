# strider-ssh-deploy-custom 

This is a modified version of strider-ssh-deploy, allowing you to specify a custom build command.

Eg, we run npm build within strider, then create an artifact only of the compiled dist folder, node_modules, and static files.

Then, this artifact is copied over to all hosts, extracted there, and the remote script run everywhere (just like original).

### install

cd into strider deployment and run `npm install tomi20v/strider-ssh-deploy-custom`

restart strider and check out the web ui -- you'll see a new plugin

### usage
@TODO

## note
tests are not updated and probably broken. @TODO
