import os from 'os';

Meteor.startup(() => {
    Meteor.settings.tensorflow = {
        userspace: {
            base: `${os.homedir()}/tensorflow-userspace`
        }
    }
});