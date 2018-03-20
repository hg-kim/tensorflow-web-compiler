import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';

import { Notes } from '/imports/api/notes';

import './note.html';
import './note.css';

const userClassList = new Mongo.Collection('userClassList');
const classListDB = new Mongo.Collection('class');
let _deps = new Tracker.Dependency;


//--------------------------------코드 테스트 note페이지 기능----------------------------------------

Template.note.onCreated(function () {
    let _deps = new Tracker.Dependency;
    this.noteId = [];
    this.noteId[0] = new ReactiveVar();
    this.currentFile = 1;
    this.maxFile = 1;
    this.currentCode = [];

    this.note = () => {
        try {
            return Notes.findOne(this.noteId[this.currentFile-1].get());
        } catch (e) {

        }
    };

    this.save = (status) => {
        const name = this.find('input[idx='+this.currentFile+']').value;
        const code = this.cm.getValue();
        this.currentCode[this.currentFile-1]=code;
        let noteId = this.noteId[this.currentFile-1].get();
        if (noteId) {
            Notes.update(noteId, {
                $set: {
                    name,
                    code,
                    status,
                }
            });
        } else {
            noteId = Notes.insert({
                name,
                code,
                status,
            });

            this.noteId[this.currentFile-1].set(noteId);
        }
    };
});

Template.note.onRendered(function () {
    this.cm = CodeMirror.fromTextArea(this.find('#editor'), {
        lineNumbers: true,
        mode: 'python',
        extraKeys: {
            "Ctrl-Space": "autocomplete"
        },
    });
});

Template.note.helpers({
    note() {
        _deps.depend();
        return Template.instance().note();
    },

    userNotes() {
        if (Accounts.userId()) {
            return Notes.find({
                userId: Accounts.userId()
            });
        } else {
            return Notes.find({
                userId: {
                    $exists: false
                }
            });
        }
    },

    disabledWhenRunning() {
        const note = Template.instance().note();
        if (note && note.status === 'running') {
            return 'disabled';
        }
    }
});

Template.note.events({
    'click .js-save' (event, instance) {
        if(instance.currentFile<1) return;
        instance.save('saved');
        _deps.changed();
    },

    'click .js-run' (event, instance) {
        if(instance.currentFile<1) return;
        instance.save('running');
        _deps.changed();
    },

    'click .js-clear' (event, instance) {
        if(instance.currentFile<1) return;
        instance.noteId[instance.currentFile-1].set(undefined);
        instance.find('input[idx='+instance.currentFile+']').value = '';
        instance.cm.setValue('');
        instance.currentCode[instance.currentFile-1]='';
        instance.cm.clearHistory();
    },

    'click .js-select' (event, instance) {
        event.preventDefault();
        event.stopPropagation();
        if(instance.currentFile<1){
            instance.maxFile+=1;
            instance.currentFile+=1;
            instance.noteId[instance.maxFile-1] = new ReactiveVar();
            let newFileName ='<div class="files" idx="'+instance.maxFile+'">\
                <input type="text" class="file-name" idx="'+instance.maxFile+'" name="title">\
                <img src="images/account/login/close.svg" alt="" idx="'+instance.maxFile+'" class="remove-file">\
            </div>';
            $(newFileName).insertBefore($(".file-plus"));
        }
        const selected = event.currentTarget.getAttribute('note-id');
        instance.noteId[instance.currentFile-1].set(selected);
        instance.cm.setValue(instance.note().code);
        instance.find('input[idx='+instance.currentFile+']').value = event.target.innerText;
        _deps.changed();
    },
    'click .file-plus' (event, instance) {
        instance.maxFile+=1;
        instance.noteId[instance.maxFile-1] = new ReactiveVar();
        let newFileName ='<div class="files" idx="'+instance.maxFile+'">\
            <input type="text" class="file-name" idx="'+instance.maxFile+'" name="title">\
            <img src="images/account/login/close.svg" alt="" idx="'+instance.maxFile+'" class="remove-file">\
        </div>';
        $(newFileName).insertBefore($(".file-plus"));
    },
    'click .file-name' (event, instance) {
        $(".file-name").removeClass("file-name-selected");
        $(event.target).addClass("file-name-selected");
        instance.currentCode[instance.currentFile-1]=instance.cm.getValue();
        instance.currentFile = $(event.target)[0]["attributes"]["idx"].nodeValue;
        try {
            instance.cm.setValue(instance.currentCode[instance.currentFile-1]);
        } catch (e) {
            instance.cm.setValue('');
        }
    },
    'mouseenter .files' (event, instance) {
        $(".remove-file[idx="+$(event.target)[0]["attributes"]["idx"].nodeValue+"]").css("opacity", "1");
    },

    'mouseleave .files' (event, instance) {
        $(".remove-file[idx="+$(event.target)[0]["attributes"]["idx"].nodeValue+"]").css("opacity", "0");
    },
    'click .remove-file' (event, instance) {
        let target = instance.noteId[$(event.target)[0]["attributes"]["idx"].nodeValue-1].curValue;
        instance.currentCode[instance.currentFile-1] = instance.cm.getValue();
        instance.currentFile = $(event.target)[0]["attributes"]["idx"].nodeValue - 1;
        instance.maxFile -= 1;
        if(instance.currentFile<1 && instance.maxFile!=0) instance.currentFile = 1;
        for(var i = $(event.target)[0]["attributes"]["idx"].nodeValue-1; i < instance.maxFile; i++){
            instance.noteId[i] = instance.noteId[i+1];
            instance.currentCode[i] =instance.currentCode[i+1];
            $(".file-name[idx="+(i+1)+"]").val($(".file-name[idx="+(i+2)+"]").val());
        }
        try {
            instance.noteId.pop();
            instance.currentCode.pop();
            instance.cm.setValue(instance.currentCode[instance.currentFile-1]);
        } catch (e) {

        }
        $(".files[idx="+(instance.maxFile+1)+"]").remove();
        try{
            Notes.remove({_id:target});
        }catch(e){

        }
    }
});



//--------------------------------메인페이지 mainContent페이지 기능----------------------------------------

Template.mainContent.onRendered(function () {
    Meteor.call('fetchClass',"none", function(err, response){
        var mainClass = '<div class="index-classroom-left">\
            <div class="index-classroom-content">\
                <div class="index-classroom-img-container float-left">\
                    <img src="'+response[2]+'" class="index-classroom-img">\
                </div>\
                <div class="index-classroom-text float-right">\
                    <p class="index-classroom-title">'+response[0]+'</p>\
                    <p class="index-classroom-desc">'+response[1]+'</p>\
                    <div class="">\
                        <button type="button" name="button" class=" index-classroom-btn float-right index-btn" target="'+response[6]+'">\
                            학습진행\
                        </button>\
                    </div>\
                </div>\
            </div>\
        </div>\
        <div class="index-classroom-right">\
            <div class="index-classroom-content">\
                <div class="index-classroom-img-container float-left">\
                    <img src="'+response[5]+'" class="index-classroom-img">\
                </div>\
                <div class="index-classroom-text float-right">\
                    <p class="index-classroom-title">'+response[3]+'</p>\
                    <p class="index-classroom-desc">'+response[4]+'</p>\
                    <div class="">\
                        <button type="button" name="button" class=" index-classroom-btn float-right index-btn" target="'+response[7]+'">\
                            학습진행\
                        </button>\
                    </div>\
                </div>\
            </div>\
        </div>\
        ';
        $(".index-container .row").append(mainClass);
    });

    Meteor.call('fetchClassList',"none", function(err, response){
        let count = 0;
        for (var row in response) {
            if(count<8){
                if(count==3){
                    $(".code-test-inner-container").append('<div class="code-test-block mr-0">\
                        <div class="code-test-header"><img src="images/index/codeTest.jpg" class="code-test-img float-left">\
                            <p class="code-test-title float-right">'+response[row].className+'</p></div>\
                        <div class="code-test-desc"><p>'+response[row].classDesc+'</p></div>\
                        <button type="button" name="button" class=" code-test-btn index-btn" target="'+response[row]._id+'">들어가기</button>\
                    </div>\
                    ');
                }
                else if(count==7){
                    $(".code-test-inner-container").append('<div class="code-test-block mr-0 mb-0">\
                        <div class="code-test-header"><img src="images/index/codeTest.jpg" class="code-test-img float-left">\
                            <p class="code-test-title float-right">'+response[row].className+'</p></div>\
                        <div class="code-test-desc"><p>'+response[row].classDesc+'</p></div>\
                        <button type="button" name="button" class=" code-test-btn index-btn" target="'+response[row]._id+'">들어가기</button>\
                    </div>\
                    ');
                }
                else if(count>3){
                    $(".code-test-inner-container").append('<div class="code-test-block mb-0">\
                        <div class="code-test-header"><img src="images/index/codeTest.jpg" class="code-test-img float-left">\
                            <p class="code-test-title float-right">'+response[row].className+'</p></div>\
                        <div class="code-test-desc"><p>'+response[row].classDesc+'</p></div>\
                        <button type="button" name="button" class=" code-test-btn index-btn" target="'+response[row]._id+'">들어가기</button>\
                    </div>\
                    ');
                }
                else{
                    $(".code-test-inner-container").append('<div class="code-test-block">\
                        <div class="code-test-header"><img src="images/index/codeTest.jpg" class="code-test-img float-left">\
                            <p class="code-test-title float-right">'+response[row].className+'</p></div>\
                        <div class="code-test-desc"><p>'+response[row].classDesc+'</p></div>\
                        <button type="button" name="button" class=" code-test-btn index-btn" target="'+response[row]._id+'">들어가기</button>\
                    </div>\
                    ');
                }
            }
            count++;
        }
    });
});

Template.mainContent.events({
    'click .index-classroom-btn' (event, instance) {
        FlowRouter.go("/learning/"+$(event.target).attr("target"));
    },
    'click .code-test-btn' (event, instance) {
        FlowRouter.go("/learning/"+$(event.target).attr("target"));
    },
    'load .index-classroom-img' : function(event, template){
        var w = $(event.target).prop("width");
        var h = $(event.target).prop("height");
        if(w>h) {
            $(event.target).css({"width":"185px", "height":"auto", "max-height":"175px"});
            $(event.target).css("margin-top",((175-$(event.target).prop("height"))/2)+"px");
        }
        else $(event.target).css({"width":"auto", "height":"175px", "max-width":"185px"});
    }
});




//--------------------------------강좌 리스트 classList페이지 기능----------------------------------------

Template.classList.onRendered(function () {
    Meteor.call('fetchClassListWithID',"none", Accounts.userId(), function(err, response){
        for (var row in response) {
            $(".class-result").append('<div class="classList-item">\
                <div class="classList-item-img float-left">\
                    <img src="'+response[row].image+'" alt="" class="w-100 h-100 m-0 p-0">\
                </div>\
                <div class="classList-item-text float-right">\
                    <div class="classList-item-title">\
                        <p>'+response[row].className+'</p>\
                    </div>\
                    <div class="classList-item-desc">\
                        <p>'+response[row].classDesc+'</p>\
                    </div>\
                    <div class="classList-item-ref align-items-end d-flex">\
                        <p class="align-bottom">'+response[row].professorName+'</p>\
                        <button type="button" name="button" class="addClass" value="'+response[row]._id+'">학습진행</button>\
                    </div>\
                </div>\
            </div>\
            ');
        }
    });
});

Template.classList.events({
    'click .searchClass' (event, instance) {
        Meteor.call('fetchClassListWithID',$(".searchClassValue").val(), Accounts.userId(), function(err, response){
            $(".class-result").empty();
            for (var row in response) {
                $(".class-result").append('<div class="classList-item">\
                    <div class="classList-item-img float-left">\
                        <img src="'+response[row].image+'" alt="" class="w-100 h-100 m-0 p-0">\
                    </div>\
                    <div class="classList-item-text float-right">\
                        <div class="classList-item-title">\
                            <p>'+response[row].className+'</p>\
                        </div>\
                        <div class="classList-item-desc">\
                            <p>'+response[row].classDesc+'</p>\
                        </div>\
                        <div class="classList-item-ref align-items-end d-flex">\
                            <p class="align-bottom">'+response[row].professorName+'</p>\
                            <button type="button" name="button" class="addClass" value="'+response[row]._id+'">학습진행</button>\
                        </div>\
                    </div>\
                </div>\
                ');
            }
        });
    },
    'click .addClass' (event, instance) {
        Meteor.call('addClass',Meteor.userId(),event.target.value, function(err, response){
            if(response=="dup") Bert.alert( "이미 등록된 과정입니다.", 'danger', 'growl-top-right', 'fa-frown-o' );
            else FlowRouter.go("/learning/"+$(event.target).attr("value"));
        });
    }
});


//--------------------------------학습현황 learningStatus페이지 기능----------------------------------------

Template.learningStatus.helpers({
    userClass() {
        if(FlowRouter.getParam("class")){
            return userClassList.find({userId: Accounts.userId(), "end" : {$gte : new Date()}}, {skip: (FlowRouter.getParam("class")-1)*5, limit: 5});
        }
        else{
            return userClassList.find({userId: Accounts.userId(), "end" : {$gte : new Date()}}, {skip: 0, limit: 5});
        }
    },
    expiredUserClass() {
        if(FlowRouter.getParam("eclass")){
            return userClassList.find({userId: Accounts.userId(), "end" : {$lt : new Date()}}, {skip: (FlowRouter.getParam("eclass")-1)*5, limit: 5});
        }
        else{
            return userClassList.find({userId: Accounts.userId(), "end" : {$lt : new Date()}}, {skip: 0, limit: 5});
        }
    },
    userClassCount() {
        let result = [];
        for(var i =0; i < userClassList.find({userId: Accounts.userId(), "end" : {$gte : new Date()}}).count()/5; i++){
            result.push(i+1);
        }
        return result;
    },
    expiredUserClassCount() {
        let result = [];
        for(var i =0; i < userClassList.find({userId: Accounts.userId(), "end" : {$lt : new Date()}}).count()/5; i++){
            result.push(i+1);
        }
        return result;
    },
    incremented(index){
        index++;
        return index;
    },
    getDate(date){
        return date.toISOString().substring(0, 10);
    },
    getLast(end){
        let now = new Date();
        let s_end = end.toISOString().substring(0, 10).split("-");
        let endDate = new Date(s_end[0], s_end[1]-1, s_end[2]);
        let diff = Math.floor((Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) )/(1000 * 60 * 60 * 24));
        if(diff<=0) return "학습 종료";
        else return diff+"일";
    },
    getStatus(end, date){
        let now = new Date();
        let s_end = end.toISOString().substring(0, 10).split("-");
        let endDate = new Date(s_end[0], s_end[1]-1, s_end[2]);
        let diff = Math.floor((Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) )/(1000 * 60 * 60 * 24));
        if((((date-diff)/date)).toFixed(2)*100>=100) return "100%";
        else return (((date-diff)/date)*100).toFixed(2)+"%";
    }
});
Template.learningStatus.events({
    'click .cancle-learning' (event, instance) {
        userClassList.remove({_id:$(event.target).attr("value")});
        Bert.alert( '수강취소가 완료되었습니다.', 'success', 'growl-top-right', 'fa-smile-o' );
    },
    'click .do-learning-btn' (event, instance) {
        FlowRouter.go("/learning/"+$(event.target).attr("value"));
    },
    'click .btn-class' (event, instance) {
        if(FlowRouter.getParam("eclass")){
            FlowRouter.go("/learningStatus/"+$(event.target).attr("value")+"/"+FlowRouter.getParam("eclass"));
        }
        else{
            FlowRouter.go("/learningStatus/"+$(event.target).attr("value")+"/1");
        }
    }
    ,
    'click .btn-eclass' (event, instance) {
        if(FlowRouter.getParam("class")){
            FlowRouter.go("/learningStatus/"+FlowRouter.getParam("class")+"/"+$(event.target).attr("value"));
        }
        else{
            FlowRouter.go("/learningStatus/1/"+$(event.target).attr("value"));
        }
    }
});


//--------------------------------학습하기 learning페이지 기능----------------------------------------

Template.learning.onCreated(function () {
    let target = new Mongo.ObjectID(FlowRouter.getParam("classId"));
    Meteor.subscribe('classInfo', target);
    let _deps = new Tracker.Dependency;
    this.noteId = [];
    this.noteId[0] = new ReactiveVar();
    this.currentFile = 1;
    this.maxFile = 1;
    this.currentCode = [];

    this.note = () => {
        return Notes.findOne(this.noteId[this.currentFile-1].get());
    };

    this.save = (status) => {
        const name = this.find('input[idx='+this.currentFile+']').value;
        const code = this.cm.getValue();
        this.currentCode[this.currentFile-1]=code;
        let noteId = this.noteId[this.currentFile-1].get();
        if (noteId) {
            Notes.update(noteId, {
                $set: {
                    name,
                    code,
                    status,
                }
            });
        } else {
            noteId = Notes.insert({
                name,
                code,
                status,
            });

            this.noteId[this.currentFile-1].set(noteId);
        }
    };
});

Template.learning.onRendered(function () {
    this.cm = CodeMirror.fromTextArea(this.find('#editor'), {
        lineNumbers: true,
        mode: 'python',
        extraKeys: {
            "Ctrl-Space": "autocomplete"
        },
    });

    Meteor.call('fetchClass',FlowRouter.getParam("classId"), function(err, response){
        let content = response[2].split("` ");
        for(var i=0; i<content.length; i+=3){
            switch (content[i]) {
                case "video":
                    $(".learning-menu-desc").append('<p class="learning-menu-desc-main" idx='+((i/3)+1)+'>'+content[i+1]+'</p>');
                    $(".learning-content-desc").append('<div class="learning-content-desc-title" id=c'+((i/3)+1)+'><p>'+content[i+1]+'</p></div>');
                    $(".learning-content-desc").append('<div class="learning-content-desc-video"><video src="'+content[i+2]+'" class="w-100 h-100" controls></video></div>');
                    break;
                case "image":
                    $(".learning-menu-desc").append('<p class="learning-menu-desc-main" idx='+((i/3)+1)+'>'+content[i+1]+'</p>');
                    $(".learning-content-desc").append('<div class="learning-content-desc-title" id=c'+((i/3)+1)+'><p>'+content[i+1]+'</p></div>');
                    $(".learning-content-desc").append('<div class="learning-content-desc-video"><image src="'+content[i+2]+'" class="w-100 h-100"></div>');
                    break;
                case "text":
                    $(".learning-menu-desc").append('<p class="learning-menu-desc-main" idx='+((i/3)+1)+'>'+content[i+1]+'</p>');
                    $(".learning-content-desc").append('<div class="learning-content-desc-title" id=c'+((i/3)+1)+'><p>'+content[i+1]+'</p></div>');
                    $(".learning-content-desc").append('<div class="learning-content-desc-text"><p>'+content[i+2]+'</p></div>');
                    break;
            }
        }


        var section = $(".learning-content-desc-title");
        var sections = {};
        for (var i = 0; i < section.length; i++) {
            sections[i] = section[i].offsetTop;
        }
        var i = 0;
        window.onscroll = function() {
          var scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
          for (i in sections) {
            if (sections[i] <= scrollPosition) {
                var target = parseInt(i)+1;
              $('.active').toggleClass('active');
              $('p[idx=' + target + ']').toggleClass('active');
            }
          }
          if(scrollPosition<=383) $(".learning-menu").css("top", (383-scrollPosition)+"px");
          else $(".learning-menu").css("top", "0");
        };
    });

    // var image = this.find('.learning-main-img');
    // console.log(image.width+", "+image.height);
    // if(image.width>image.height) $(".learning-main-img").css({"width":"286px", "height":"auto"});
    // else $(".learning-main-img").css({"width":"auto", "height":"200px"});

    let target = new Mongo.ObjectID(FlowRouter.getParam("classId"));
    let cur = classListDB.find({_id : target}).fetch();
    try {
        let raw_content = cur[0].content;
        let content = raw_content.split("` ");
        let file_name = [];
        for(var i=0, j=0; i<content.length; i+=3){
            if(content[i]=="code"){
                this.currentCode[j] = content[i+2];
                file_name.push(content[i+1]);
                j+=1;
            }
        }
        for (var i = 0; i < this.currentCode.length; i++) {
            if(i == 0){
                this.cm.setValue(this.currentCode[i]);
                $(".file-name").val(file_name[i]);
            }
            else{
                this.maxFile+=1;
                this.noteId[this.maxFile-1] = new ReactiveVar();
                let newFileName ='<div class="files" idx="'+this.maxFile+'">\
                    <input type="text" class="file-name" idx="'+this.maxFile+'" value="'+file_name[i]+'" name="title">\
                    <img src="images/account/login/close.svg" alt="" idx="'+this.maxFile+'" class="remove-file">\
                </div>';
                $(newFileName).insertBefore($(".file-plus"));
            }
        }
    } catch (e) {
    }

});

Template.learning.helpers({
    note() {
        _deps.depend();
        return Template.instance().note();
    },

    userNotes() {
        if (Accounts.userId()) {
            return Notes.find({
                userId: Accounts.userId()
            });
        } else {
            return Notes.find({
                userId: {
                    $exists: false
                }
            });
        }
    },

    disabledWhenRunning() {
        const note = Template.instance().note();
        if (note && note.status === 'running') {
            return 'disabled';
        }
    },

    getClassName(){
        let target = new Mongo.ObjectID(FlowRouter.getParam("classId"));
        let cur = classListDB.find({_id : target}).fetch();
        try {
            return cur[0].className;
        } catch (e) {

        }
    },

    getClassDesc(){
        let target = new Mongo.ObjectID(FlowRouter.getParam("classId"));
        let cur = classListDB.find({_id : target}).fetch();
        try {
            return cur[0].classDesc;
        } catch (e) {

        }
    },

    getImage(){
        let target = new Mongo.ObjectID(FlowRouter.getParam("classId"));
        let cur = classListDB.find({_id : target}).fetch();
        try {
            return cur[0].image;
        } catch (e) {

        }
    },

    getClassCode(){
        let target = new Mongo.ObjectID(FlowRouter.getParam("classId"));
        let cur = classListDB.find({_id : target}).fetch();
        try {
            let raw_content = cur[0].content;
            let content = raw_content.split("` ");
            let file_name = [];
            for(var i=0, j=0; i<content.length; i+=3){
                if(content[i]=="code"){
                    Template.instance().currentCode[j] = content[i+2];
                    file_name.push(content[i+1]);
                    j+=1;
                }
            }
            for (var i = 0; i < Template.instance().currentCode.length; i++) {
                if(i == 0){
                    Template.instance().cm.setValue(Template.instance().currentCode[i]);
                    $(".file-name").val(file_name[i]);
                }
                else{
                    Template.instance().maxFile+=1;
                    Template.instance().noteId[Template.instance().maxFile-1] = new ReactiveVar();
                    let newFileName ='<div class="files" idx="'+Template.instance().maxFile+'">\
                        <input type="text" class="file-name" idx="'+Template.instance().maxFile+'" value="'+file_name[i]+'" name="title">\
                        <img src="images/account/login/close.svg" alt="" idx="'+Template.instance().maxFile+'" class="remove-file">\
                    </div>';
                    $(newFileName).insertBefore($(".file-plus"));
                }
            }
        } catch (e) {
        }
    },
});

Template.learning.events({
    'click .js-save' (event, instance) {
        instance.save('saved');
        _deps.changed();
    },

    'click .js-run' (event, instance) {
        instance.save('running');
        _deps.changed();
    },

    'click .js-clear' (event, instance) {
        instance.noteId[instance.currentFile-1].set(undefined);
        instance.find('input[idx='+instance.currentFile+']').value = '';
        instance.cm.setValue('');
        instance.currentCode[instance.currentFile-1]='';
        instance.cm.clearHistory();
    },
    'click .file-plus' (event, instance) {
        instance.maxFile+=1;
        instance.noteId[instance.maxFile-1] = new ReactiveVar();
        let newFileName ='<div class="files" idx="'+instance.maxFile+'">\
            <input type="text" class="file-name" idx="'+instance.maxFile+'" name="title">\
            <img src="images/account/login/close.svg" alt="" idx="'+instance.maxFile+'" class="remove-file">\
        </div>';
        $(newFileName).insertBefore($(".file-plus"));
    },

    'click .file-name' (event, instance) {
        $(".file-name").removeClass("file-name-selected");
        $(event.target).addClass("file-name-selected");
        instance.currentCode[instance.currentFile-1]=instance.cm.getValue();
        instance.currentFile = $(event.target)[0]["attributes"]["idx"].nodeValue;
        try {
            instance.cm.setValue(instance.currentCode[instance.currentFile-1]);
        } catch (e) {
            instance.cm.setValue('');
        }
    },
    'mouseenter .files' (event, instance) {
        $(".remove-file[idx="+$(event.target)[0]["attributes"]["idx"].nodeValue+"]").css("opacity", "1");
    },

    'mouseleave .files' (event, instance) {
        $(".remove-file[idx="+$(event.target)[0]["attributes"]["idx"].nodeValue+"]").css("opacity", "0");
    },
    'click .remove-file' (event, instance) {
        let target = instance.noteId[$(event.target)[0]["attributes"]["idx"].nodeValue-1].curValue;
        instance.currentCode[instance.currentFile-1] = instance.cm.getValue();
        instance.currentFile = $(event.target)[0]["attributes"]["idx"].nodeValue - 1;
        instance.maxFile -= 1;
        if(instance.currentFile<1 && instance.maxFile!=0) instance.currentFile = 1;
        for(var i = $(event.target)[0]["attributes"]["idx"].nodeValue-1; i < instance.maxFile; i++){
            instance.noteId[i] = instance.noteId[i+1];
            instance.currentCode[i] =instance.currentCode[i+1];
            $(".file-name[idx="+(i+1)+"]").val($(".file-name[idx="+(i+2)+"]").val());
        }
        try {
            instance.noteId.pop();
            instance.currentCode.pop();
            instance.cm.setValue(instance.currentCode[instance.currentFile-1]);
        } catch (e) {

        }
        $(".files[idx="+(instance.maxFile+1)+"]").remove();
        try{
            Notes.remove({_id:target});
        }catch(e){

        }
    },
    'click .learning-menu-desc-sub' (event, instance){
        $('html, body').animate({
            scrollTop: $("#c"+$(event.target).attr("idx")).offset().top
        }, 750);
    },
    'click .learning-menu-desc-main' (event, instance){
        $('html, body').animate({
            scrollTop: $("#c"+$(event.target).attr("idx")).offset().top
        }, 750);
    },
    'load .learning-main-img' : function(event, template){
        var w = $(".learning-main-img").prop("width");
        var h = $(".learning-main-img").prop("height");
        if(w>h) {
            $(".learning-main-img").css({"width":"286px", "height":"auto", "max-height":"200px"});
            $(".learning-main-img").css("margin-top",((200-$(".learning-main-img").prop("height"))/2)+"px");
        }
        else $(".learning-main-img").css({"width":"auto", "height":"200px", "max-width":"286px"});
    }
});


Template.findID.onRendered(function () {
    $(".findID-modal").hide();
});

Template.findPW.onRendered(function () {
    $(".findID-modal").hide();
});

Template.mainTopBar.events({
    'click .topbar-a' (event, instance) {
        if(event.target.tagName.toLowerCase() === 'a'){
            $(".topbar-a").removeClass("topbar-a-active");
            $(event.target).parent().addClass("topbar-a-active");
        }
    },
    'click .topbar-img' (event, instance){
        $(".topbar-a").removeClass("topbar-a-active");
    }
})

Template.mainContent.onRendered(function(){
    var slideIndex = 0;
    showSlides();

    function showSlides() {
        var i;
        var slides = document.getElementsByClassName("mySlides");
        for (i = 0; i < slides.length; i++) {
           slides[i].style.display = "none";
        }
        slideIndex++;
        if (slideIndex > slides.length) {slideIndex = 1}
        try {
            slides[slideIndex-1].style.display = "block";
        } catch (e) {

        }
        setTimeout(showSlides, 5000);
    }
});

Template.modifyMyInfoDetail.helpers({
    getUser() {
        try {
            return Meteor.user().username;
        } catch (e) {}
    },
    getGender() {
        try {
            return Meteor.user().profile.gender=="남성";
        } catch (e) {}
    },
    getBirth() {
        try {
            let result = Meteor.user().profile.birth.slice(4,6)+"/"+ Meteor.user().profile.birth.slice(6)+"/"+ Meteor.user().profile.birth.slice(0,4);
            return result;
        } catch (e) {}
    },
    getPhone1(target) {
        try {
            if(target == Meteor.user().profile.phone.slice(0,3)) return "selected";
        } catch (e) {}
    },
    getPhone2() {
        try {
            return Meteor.user().profile.phone.slice(3,7);
        } catch (e) {}
    },
    getPhone3() {
        try {
            return Meteor.user().profile.phone.slice(7);
        } catch (e) {}
    },
    getPhoneAd() {
        try {
            return Meteor.user().profile.phoneAd=="예";
        } catch (e) {}
    },
    getInt1(target) {
        try {
            if(target == Meteor.user().profile.interest1) return "selected";
        } catch (e) {}
    },
    getInt2(target) {
        try {
            if(target == Meteor.user().profile.interest2) return "selected";
        } catch (e) {}
    }
});
