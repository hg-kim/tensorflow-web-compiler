//default
FlowRouter.route('/', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'mainContent',  footer:'mainFooter'});
  },
});

FlowRouter.notFound = {
    action: function() {
    alert("404!");
    location.href="/";
  }
};


//account
FlowRouter.route('/login', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'login',  footer:'mainFooter'});
  }
});

FlowRouter.route('/register', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'register',  footer:'mainFooter'});
  }
});

FlowRouter.route('/findID', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'findID',  footer:'mainFooter'});
  }
});

FlowRouter.route('/findPW', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'findPW',  footer:'mainFooter'});
  }
});


//learningPage
FlowRouter.route('/classList', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'classList',  footer:'mainFooter'});
  }
});

FlowRouter.route('/learning', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'learning',  footer:'mainFooter'});
  }
});

FlowRouter.route('/learning/:classId', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'learning',  footer:'mainFooter'});
  }
});


//myPage
FlowRouter.route('/learningStatus', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'learningStatus',  footer:'mainFooter'});
  }
});

FlowRouter.route('/learningStatus/:class/:eclass', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'learningStatus',  footer:'mainFooter'});
  }
});

FlowRouter.route('/manageClass', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'manageClass',  footer:'mainFooter'});
  }
});

FlowRouter.route('/modifyMyInfo', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'modifyMyInfo',  footer:'mainFooter'});
  }
});

FlowRouter.route('/modifyPW', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'modifyPW',  footer:'mainFooter'});
  }
});

FlowRouter.route('/myClass', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'myClass',  footer:'mainFooter'});
  }
});

FlowRouter.route('/modifyMyInfoDetail', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'modifyMyInfoDetail',  footer:'mainFooter'});
  }
});


//sampleCodePage
FlowRouter.route('/codeTest', {
    action: function() {
    BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'note',  footer:'mainFooter'});
  }
});
FlowRouter.route('/hello', {
  action: function() {
  BlazeLayout.render('applicationLayout', {header:'mainTopBar', main:'note',  footer:'mainFooter'});
}
});
