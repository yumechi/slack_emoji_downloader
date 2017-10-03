'use strict';

var deferreds;
var zip;

$(function () {
    $('h4:last').after('<input type="button" id="slack_emoji_dl" class="btn btn-info" value="Save all emoji" style="background-color:#248">');
});

$(document).on('click', '#slack_emoji_dl', function () {
    zip = new JSZip();
    deferreds = $.Deferred();
    var promise = deferreds;
    
    // 選択した画像分ループ
    $('html').html().split('\n').some(function(val, index) {
        if(!val.match(/data-original=\"(.*?)\"/)) {
            return false;
        }

        let url = val.match(/data-original=\"(.*?)\"/)[1];
        let fragments = url.split('/');
        let filename = fragments[fragments.length-2] + 
                       '.' + fragments[fragments.length-1].split('.')[1];
        // debug
        console.log(filename + ', ' + url);

        // 画像読み込み（非同期処理）
        promise = promise.then(function() {
            var newPromise = new $.Deferred();
            
            // XMLHttpRequestは事前にmanifest.jsonでアクセス先を
            // 登録しておく必要あり（そうしないとクロスドメインで動きません）
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.addEventListener('load', function() {
                // zipにレスポンスデータを追加
                zip.file(filename, xhr.response);
                newPromise.resolve();
            });
            xhr.send();
            
            return newPromise;
        });
    });
    
    promise.then(function(){
        zip.generateAsync({type:'blob'}).then(function (content) {
            saveAs(content, location.hostname + '_emoji.zip');
        });
    });
    deferreds.resolve();
});
