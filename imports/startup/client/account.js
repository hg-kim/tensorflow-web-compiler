import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

if (Meteor.isClient) {
    //회원가입
    Template.register.events({
        'click .register-btn': function(event) {
            let check = $(".register-panel input[type=text]");
            let check_all = true;
            for(var i = 0; i < check.length; i++){
                if(check[i].value==""){
                    $(check[i]).css("border","2px solid red");
                    check_all = false;
                }
                else{
                    $(check[i]).css("border","2px solid #bfbfbf");
                }
            }
            check = $(".register-panel input[type=password]");
            for(var i = 0; i < check.length; i++){
                if(check[i].value==""){
                    $(check[i]).css("border","2px solid red");
                    check_all = false;
                }
                else{
                    $(check[i]).css("border","2px solid #bfbfbf");
                }
            }
            check = $(".register-panel input[name=hp-ad]:checked");
            if(check.val()==undefined){
                $(check).css("border","2px solid red");
                check_all = false;
            }
            else{
                $(check[i]).css("border","2px solid #bfbfbf");
            }
            check = $(".register-panel input[name=gender]:checked");
            if(check.val()==undefined){
                $(check).css("border","2px solid red");
                check_all = false;
            }
            else{
                $(check[i]).css("border","2px solid #bfbfbf");
            }
            if(check_all == false){
                Bert.alert( "필수 입력 항목을 모두 채워주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
                return;
            }
            event.preventDefault();
            var emailVar = $('[name=registerEmail]').val();
            var passwordVar = $('[name=registerPassword]').val();
            var passwordVaR = $('[name=registerPasswordRepeat]').val();
            var bdate = $('[name=birth]').val().split("/");
            if(!emailVar.includes("@")){
                $('[name=registerEmail]').css("border","2px solid red");
                Bert.alert( "아이디를 이메일 형식으로 입력해주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
                return;
            }
            if(passwordVar.length>15 || passwordVar.length<8){
                $('[name=registerPassword]').css("border","2px solid red");
                Bert.alert( "비밀번호는 8~15자리 이내여야 합니다..", 'danger', 'growl-top-right', 'fa-frown-o' );
                return;
            }
            else{
                $('[name=registerEmail]').css("border","2px solid #bfbfbf");
            }
            if(passwordVar==passwordVaR){
                Accounts.createUser({
                    email: emailVar,
                    password: passwordVar,
                    username : $('[name=name]').val(),
                    gender : $('[name=gender]:checked').val(),
                    birth : bdate[2]+bdate[0]+bdate[1],
                    phone : $(".findID-hp-1").val()+$(".findID-hp-2").val()+$(".findID-hp-3").val(),
                    phoneAd : $('[name=hp-ad]:checked').val(),
                    interest1 : $('[name=interest-1]').val(),
                    interest2 : $('[name=interest-2]').val()
                },function(err){
                    if(err){
                        Bert.alert( err.reason, 'danger', 'growl-top-right', 'fa-frown-o' );
                    }
                    else{
                        Bert.alert( '회원가입이 성공적으로 완료되었습니다.', 'success', 'growl-top-right', 'fa-smile-o' );
                        FlowRouter.go('/');
                    }
                });
            }
            else{
                Bert.alert( "비밀번호와 비밀번호 확인이 다릅니다.", 'danger', 'growl-top-right', 'fa-frown-o' );
            }
        }
    });

    Template.register.onRendered(function(){
        $('#sandbox-container').datepicker({
            startView: 2,
            language: "kr",
            autoclose: true
        });
    });

    //로그인
    Template.login.events({
        'submit form': function(event) {
            event.preventDefault();

            let check = $("input[type=text]");
            let check_all = true;
            for(var i = 0; i < check.length; i++){
                if(check[i].value==""){
                    $(check[i]).css("border","2px solid red");
                    check_all = false;
                }
                else{
                    $(check[i]).css("border","2px solid #bfbfbf");
                }
            }
            check = $("input[type=password]");
            for(var i = 0; i < check.length; i++){
                if(check[i].value==""){
                    $(check[i]).css("border","2px solid red");
                    check_all = false;
                }
                else{
                    $(check[i]).css("border","2px solid #bfbfbf");
                }
            }
            if(check_all == false){
                Bert.alert( "입력 항목을 모두 채워주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
                return;
            }

            var emailVar = $('[name=loginEmail]').val();
            var passwordVar = $('[name=loginPassword]').val();
            Meteor.loginWithPassword({email:emailVar}, passwordVar, function(err){
                if(err){
                    Bert.alert( err.reason, 'danger', 'growl-top-right', 'fa-frown-o' );
                }
                else{
                    Bert.alert( '환영합니다. '+emailVar+'님.', 'success', 'growl-top-right', 'fa-smile-o' );
                    FlowRouter.go('/');
                }
            });
        },
        'click .toRegister': function(event) {
            event.preventDefault();
            FlowRouter.go('/register');
        },
        'click .toFindIdPw': function(event) {
            event.preventDefault();
            FlowRouter.go('/findID');
        }
    });

    //로그아웃
    Template.mainTopBar.events({
    'click .logout': function(event){
            event.preventDefault();
            Meteor.logout();
            Bert.alert( '성공적으로 로그아웃되었습니다.', 'success', 'growl-top-right', 'fa-smile-o' );
            FlowRouter.go('/');
        },
    'mouseenter .dropdown, .dropdown-content': function(event){
            $(".dropdown-content").css("display", "block");
            console.log(1);
        },
    'mouseleave .dropdown': function(event){
            $(".dropdown-content").css("display", "none");
            console.log(1);
        }
    });

    Template.findID.events({
    'click .findID-btn': function(event){
            event.preventDefault();

            let check = $("input[type=text]");
            let check_all = true;
            for(var i = 0; i < check.length; i++){
                if(check[i].value==""){
                    $(check[i]).css("border","2px solid red");
                    check_all = false;
                }
                else{
                    $(check[i]).css("border","2px solid #bfbfbf");
                }
            }
            if(check_all == false){
                Bert.alert( "입력 항목을 모두 채워주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
                return;
            }

            if($(".findID-name").val()==""){
                Bert.alert( "이름을 입력해주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
            }
            else{
                var bdate = $(".findID-birth").val().split("/");
                Meteor.call('findIdFunction',$(".findID-name").val(),(bdate[2]+bdate[0]+bdate[1]), $(".findID-hp-1").val()+$(".findID-hp-2").val()+$(".findID-hp-3").val(), function(err, response) {
                    if (response == "null") {
                        Bert.alert( "입력하신 정보와 일치하는 학습자를 찾을 수 없습니다.", 'danger', 'growl-top-right', 'fa-frown-o' );
                    } else{
                        $(".findID-modal-desc").text("해당 개인정보로 가입된 아이디는 "+response+" 입니다.");
                        $(".findID-modal").show();
                    }
                });
            }
        },
    'click .findID-modal-submit': function(event){
            event.preventDefault();
            location.reload();
        },
    'click .findID-modal-close': function(event){
            event.preventDefault();
            location.reload();
        }
    });

    Template.findID.onRendered(function(){
        $('#sandbox-container').datepicker({
            startView: 2,
            language: "kr",
            autoclose: true
        });
    });

    Template.findPW.events({
    'click .findPW-btn': function(event){
            event.preventDefault();
            let check = $("input[type=text]");
            let check_all = true;
            for(var i = 0; i < check.length; i++){
                if(check[i].value==""){
                    $(check[i]).css("border","2px solid red");
                    check_all = false;
                }
                else{
                    $(check[i]).css("border","2px solid #bfbfbf");
                }
            }
            if(check_all == false){
                Bert.alert( "입력 항목을 모두 채워주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
                return;
            }

            if($(".findPW-id").val()==""){
                Bert.alert( "아이디를 입력해주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
            }
            else{
                var bdate = $(".findID-birth").val().split("/");
                Meteor.call('findPwFunction',$(".findPW-id").val(), $(".findPW-username").val(), (bdate[2]+bdate[0]+bdate[1]), "none", function(err, response) {
                    if (response == false) {
                        Bert.alert( "입력하신 정보와 일치하는 학습자를 찾을 수 없습니다.", 'danger', 'growl-top-right', 'fa-frown-o' );
                    } else{
                        $(".findID-modal").show();
                    }
                });
            }
        },
    'click .findID-modal-submit': function(event){
            event.preventDefault();
            let check = $(".mofidyPW-pwd");
            let check_all = true;
            for(var i = 0; i < check.length; i++){
                if(check[i].value==""){
                    $(check[i]).css("border","2px solid red");
                    check_all = false;
                }
                else{
                    $(check[i]).css("border","2px solid #bfbfbf");
                }
            }
            if(check_all == false){
                Bert.alert( "입력 항목을 모두 채워주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
                return;
            }
            else if(!($(".new-pw-1").val() == $(".new-pw-2").val())){
                Bert.alert( "새 비밀번호와 새 비밀번호 확인이 같지 않습니다.", 'danger', 'growl-top-right', 'fa-frown-o' );
            }
            else if($(".new-pw-1").val().length>15 || $(".new-pw-1").val().length<8){
                $('[name=registerPassword]').css("border","2px solid red");
                Bert.alert( "비밀번호는 8~15자리 이내여야 합니다..", 'danger', 'growl-top-right', 'fa-frown-o' );
                return;
            }
            else{
                var bdate = $(".findID-birth").val().split("/");
                Meteor.call('findPwFunction',$(".findPW-id").val(), $(".findPW-username").val(), (bdate[2]+bdate[0]+bdate[1]), $(".new-pw-1").val(), function(err, response) {
                    Bert.alert( "비밀번호 변경 성공", 'success', 'growl-top-right', 'fa-smile-o' );
                    FlowRouter.go("/login");
                });
            }
        },
    'click .findID-modal-close': function(event){
            event.preventDefault();
            $(".findID-modal").hide();
        }
    });

    Template.findPW.onRendered(function(){
        $('#sandbox-container').datepicker({
            startView: 2,
            language: "kr",
            autoclose: true
        });
    });

    Template.modifyPW.events({
    'click .mofidyPW-btn-1': function(event){
            event.preventDefault();

            let check = $("input[type=password]");
            let check_all = true;
            for(var i = 0; i < check.length; i++){
                if(check[i].value==""){
                    $(check[i]).css("border","2px solid red");
                    check_all = false;
                }
                else{
                    $(check[i]).css("border","2px solid #bfbfbf");
                }
            }
            if(check_all == false){
                Bert.alert( "입력 항목을 모두 채워주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
                return;
            }

            if($(".cur-pw").val()==""){
                Bert.alert( "현재 비밀번호를 입력해주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
            }
            else if(!($(".new-pw-1").val() == $(".new-pw-2").val())){
                Bert.alert( "새 비밀번호와 새 비밀번호 확인이 같지 않습니다.", 'danger', 'growl-top-right', 'fa-frown-o' );
            }
            else{
                Accounts.changePassword($(".cur-pw").val(), $(".new-pw-1").val(), function(err){
                    if(err) Bert.alert( err.reason, 'danger', 'growl-top-right', 'fa-frown-o' );
                    else Bert.alert( "비밀번호 변경 성공", 'success', 'growl-top-right', 'fa-smile-o' );
                });
            }
        }
    });

    Template.modifyMyInfo.events({
    'click .modifyMyInfo-btn': function(event){
            event.preventDefault();

            let check = $("input[type=password]");
            let check_all = true;
            for(var i = 0; i < check.length; i++){
                if(check[i].value==""){
                    $(check[i]).css("border","2px solid red");
                    check_all = false;
                }
                else{
                    $(check[i]).css("border","2px solid #bfbfbf");
                }
            }
            if(check_all == false){
                Bert.alert( "현재 비밀번호를 입력해주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
                return;
            }

            if($(".modifyMyInfo-pwd").val()==""){
                Bert.alert( "현재 비밀번호를 입력해주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
            }
            else{
                Accounts.changePassword($(".modifyMyInfo-pwd").val(), $(".modifyMyInfo-pwd").val(), function(err){
                    if(err) Bert.alert( err.reason, 'danger', 'growl-top-right', 'fa-frown-o' );
                    else FlowRouter.go('/modifyMyInfoDetail');
                })
            }
        }
    });

    Template.modifyMyInfoDetail.events({
    'click .register-btn': function(event){
            event.preventDefault();

            let check = $(".register-panel input[type=text]");
            let check_all = true;
            for(var i = 0; i < check.length; i++){
                if(check[i].value==""){
                    $(check[i]).css("border","2px solid red");
                    check_all = false;
                }
                else{
                    $(check[i]).css("border","2px solid #bfbfbf");
                }
            }
            check = $(".register-panel input[type=password]");
            for(var i = 0; i < check.length; i++){
                if(check[i].value==""){
                    $(check[i]).css("border","2px solid red");
                    check_all = false;
                }
                else{
                    $(check[i]).css("border","2px solid #bfbfbf");
                }
            }
            check = $(".modifyMyInfoDetail-hp-ad:checked");
            if(check.val()==undefined){
                $(check).css("border","2px solid red");
                check_all = false;
            }
            else{
                $(check[i]).css("border","2px solid #bfbfbf");
            }
            check = $(".modifyMyInfoDetail-gender:checked");
            if(check.val()==undefined){
                $(check).css("border","2px solid red");
                check_all = false;
            }
            else{
                $(check[i]).css("border","2px solid #bfbfbf");
            }
            if(check_all == false){
                Bert.alert( "필수 입력 항목을 모두 채워주세요.", 'danger', 'growl-top-right', 'fa-frown-o' );
                return;
            }


            var bdate = $(".modifyMyInfoDetail-birth").val().split("/");
            Meteor.call('updateMyInfoFunction', Meteor.users.find({}).fetch()[0]["_id"], $(".modifyMyInfoDetail-username").val(), $(".modifyMyInfoDetail-gender:checked").val(), (bdate[2]+bdate[0]+bdate[1]),  $(".findID-hp-1").val()+$(".findID-hp-2").val()+$(".findID-hp-3").val(), $(".modifyMyInfoDetail-hp-ad:checked").val(), $(".interest-1").val(), $(".interest-2").val(), function(err, response) {
                Bert.alert( "개인정보 변경 성공", 'success', 'growl-top-right', 'fa-smile-o' );
            });
        }
    });

    Template.modifyMyInfoDetail.onRendered(function(){
        $('#sandbox-container').datepicker({
            startView: 2,
            language: "kr",
            autoclose: true
        });
    });
}
