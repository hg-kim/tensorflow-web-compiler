import './fixtures.js';
import { Mongo } from 'meteor/mongo'

Accounts.onCreateUser(function(options, user) {
   user.profile = options.profile || {};
   user.profile.gender = options.gender;
   user.profile.birth = options.birth;
   user.profile.phone = options.phone;
   user.profile.phoneAd = options.phoneAd;
   user.profile.interest1 = options.interest1;
   user.profile.interest2 = options.interest2;
   return user;
});


Meteor.startup(function () {
  smtp = {
    // username: 'ngnlab2018@gmail.com',
    // password: 'NGNNGN10',
    // server:   'smtp.gmail.com',
    username: 'ngnlab2018@gmail.com',
    password: 'NGNNGN10',
    server:   'smtp.sendgrid.net',
    port: 587
  }

  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
});

if (Meteor.isServer) {


    const ClassList = new Mongo.Collection('class');
    const userClassList = new Mongo.Collection('userClassList');

    Meteor.publish('classInfo', function getClassInfo(classId){
        return ClassList.find({"_id._str":classId});
    });

  Meteor.methods({
    findIdFunction: function (username, birth, phone) {
        let currentUserInfo = Meteor.users.findOne({"username":username, "profile.birth":birth, "profile.phone":phone});
        if(currentUserInfo) return currentUserInfo["emails"][0].address;
        else return "null";
    },
    findPwFunction: function (id, username, birth, pw) {
        let currentUserInfo = Meteor.users.findOne({"emails.address":id, "username":username, "profile.birth":birth});
        if(currentUserInfo && pw == "none") return true;
        else if(currentUserInfo && pw != "none") Accounts.setPassword(currentUserInfo["_id"], pw);
        else{
            return false;
        }
        // try {
        //     Accounts.sendResetPasswordEmail(currentUserInfo["_id"]);
        //     return true;
        // } catch (e) {
        //     console.log(e);
        //     return false;
        // }
    },
    updateMyInfoFunction: function (id, username, gender, birth, hp, hp_ad, interest1, interest2) {
        Meteor.users.update({"_id":id},{$set : {username:username, "profile.gender":gender, "profile.birth":birth, "profile.phone":hp, "profile.phoneAd":hp_ad, "profile.interest1":interest1, "profile.interest2":interest2}});
    },
    fetchClass: function (id) {
        let data;
        let result = [];
        let row;
        if(id=="none") {
            data = ClassList.find({});
            row = data.fetch();
            result = [row[0].className, row[0].classDesc, row[0].image, row[1].className, row[1].classDesc, row[1].image, row[0]._id, row[1]._id];
        }
        else{
            let target = new Mongo.ObjectID(id);
            data = ClassList.findOne({_id:target});
            result = [data.className, data.classDesc, data.content, data.date, data.image, data.professorName, data._id];
        }
        return result;
    },
    fetchClassList: function (condition) {
        let data;
        if(condition!="none"){
            let query = ".*"+condition+".*";
            data = ClassList.find({"className": {$regex : query}});
        }
        else {
            data = ClassList.find({});
        }
        for(var i = 0; i < data.count(); i++){
            return data.fetch()
        }
    },
    fetchClassListWithID: function (condition, id) {
        let data;
        if(condition!="none"){
            let query = ".*"+condition+".*";
            data = ClassList.find({"className": {$regex : query}});
        }
        else {
            data = ClassList.find({});
        }
        let result = [];
        data = data.fetch();
        for (var row in data) {
            if (userClassList.find({classId:data[row]._id._str, userId:Accounts.userId()}).count()==0) {
                result.push(data[row]);
            }
        }
        return result;
    },
    addClass: function (userId, classId) {
        if(userClassList.find({"userId" : userId, "classId":classId}).count()==0){
            let target = new Mongo.ObjectID(classId);
            let classInfo = ClassList.findOne({_id:target});
            let date = new Date();
            let endDate = new Date();
            endDate.setDate(date.getDate()+classInfo.date);
            userClassList.insert({"userId" : userId, "classId":classId, "start":date, "end":endDate, "className" : classInfo.className, "classDate" : classInfo.date});
            return "success";
        }
        else return "dup";
    }
  });
}
