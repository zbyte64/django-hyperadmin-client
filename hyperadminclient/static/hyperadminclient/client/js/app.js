jQuery(function($) {
    $.extend({
        serializeJSON: function(obj) {
            var t = typeof(obj);
            if(t != "object" || obj === null) {
                // simple data type
                if(t == "string") obj = '"' + obj + '"';
                return String(obj);
            } else {
                // array or object
                var json = [], arr = (obj && obj.constructor == Array);
 
                $.each(obj, function(k, v) {
                    t = typeof(v);
                    if(t == "string") v = '"' + v + '"';
                    else if (t == "object" & v !== null) v = $.serializeJSON(v)
                    json.push((arr ? "" : '"' + k + '":') + String(v));
                });
 
                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        }
    });
});

var App = {};

App.serializeFormJSON = function(form) {
    //TODO power this by the view context as well as form
    var o = Array();
    form.find(':input').each(function() {
        var $this = $(this)
        if ($this.data('api-skip') || !$this.attr('name')) return;
        var type = $this.data('api-type') || $this.attr('type') || 'text'
        var value = $this.val()
        var name = $this.attr('name')
        o.push({"type": type,
                "value": value,
                "name": name})
    });
    return $.serializeJSON({'data':o});
};

App.contentType = 'application/vnd.Collection.hyperadmin+JSON';
App.inlineContentType = 'text/html;inline=1';

App.requestDefaults = {
    accepts: {
        'json': App.contentType, //custom media type defintion
        'html;inline=1': App.inlineContentType
    },
    //success: App.resourceController.handleResponse,
    //error: App.handleResponseError,
    contentType: App.contentType,
    dataType: "html", //we are to get html back even though we send JSON
    beforeSend: function(jqXHR, settings) { //inject csrf token
        jQuery(document).ajaxSend(function(event, xhr, settings) {
            function getCookie(name) {
                var cookieValue = null;
                if (document.cookie && document.cookie != '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = jQuery.trim(cookies[i]);
                        // Does this cookie string begin with the name we want?
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }
            function safeMethod(method) {
                return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
            }
            
            if (!safeMethod(settings.type) && !settings.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        });
    }
};

App.uploadingFiles = false;
App.initUploadFile = function(field, options) {
  console.log('upload init', field, options)
  var endpoint = field.attr('data-resource-url');
  var upload_to = field.attr('data-upload-to') || '';
  
  function add(e, data) {
    console.log('upload add', e, data)
    App.uploadingFiles = true;
    
    var fileInput = $(e.target);
    var file = data.files[0];
    fileInput.siblings('.uploadstatus').remove()
    fileInput.after('<span class="uploadstatus">Uploading: '+file.name+'<span class="uploadprogress">&nbsp;</span></span>')
    fileInput.hide()
    
    function startUpload(collection_data, textStatus, jqXHR) {
        data.formData = {};
        collection = App.CollectionController.create({})
        collection.set('data', collection_data['collection'])
        var templates = collection.get('templates')
        for(var index=0; index<templates.get('length'); index++) {
            template = templates.objectAt(index)
            if (template.get('rel') == 'direct-upload') {
                
                var rows = template.get('data')
                for(var j=0; j<rows.length; j++) {
                    var row = rows[j]
                    if (row['type'] != 'file') {
                        data.formData[row['name']] = row['value'];
                    } else {
                        data.fileInput.attr('name', row['name']);
                        data.paramName = [row['name']];
                    }
                }
                data.url = template.get('href');
                console.log("Sending file", data, data.formData)
                data.submit()
                return true;
            }
        }
        return false;
    }
    
    if (endpoint) {
        /* file uploads require a single ajax request to get an upload slot
         * this is the first request to get a signed url */
        var settings = $.extend({}, App.requestDefaults, {
            type: 'POST',
            url: endpoint,
            success: startUpload,
            data : {'name': file.name,
                    'upload_to': upload_to},
        })
        $.ajax(settings);
    } else {
        console.log('boo')
        data.formData = {'name':'hyperadmin-tmp/'+file.name}
        data.submit()
    }
  }
  function progress(e, data) {
    console.log('upload progress', e, data)
    var fileInput = $(e.target);
    var progress = parseInt(data.loaded / data.total * 100, 10);
    fileInput.siblings('.uploadstatus').find('.uploadprogress').text(progress+'%')
  }
  function fail(e, data) {
    console.log('upload fail', e, data)
    remove_click()
  }
  function done(e, raw_data) {
    console.log('upload done', e, raw_data)
    
    var data = null;
    if (raw_data.dataType == 'iframe text') {
      data = $.parseJSON(raw_data.result);
    } else {
      data = $.parseJSON($(raw_data.result).text());
    }
    console.log(data)
    var fileInput = $(e.target);
    var fields = data.collection.items[0]['data']
    var path = null;
    var file = raw_data.files[0]
    console.log(fields)
    for(var i=0; i<fields.length; i++) {
      var field = fields[i];
      if (field.name == 'name') {
        path = field.value;
        break;
      }
    }
    
    function remove_click() {
      fileInput.data('path', null);
      fileInput.siblings('.uploadstatus').remove()
      fileInput.show()
    }
    
    fileInput.data('api-skip', true);
    fileInput.data('path', path);
    fileInput.siblings('.uploadstatus').remove()
    fileInput.after('<span class="uploadstatus">File uploaded: '+file.name+' <a href="#">Remove</a><input name="'+fileInput.attr('name')+'" value="'+path+'" type="hidden"/></span>')
    fileInput.siblings('.uploadstatus').find('a').click(remove_click)
    fileInput.siblings('.uploadstatus').find(':input').data('api-type', 'file')
    
    var form = get_form(this)
    if (form.data('submitted')) {
      //TODO submit form
    }
  }
  function stop(e) {
    console.log('upload stop', e)
    App.uploadingFiles = false;
  }
  
  function get_form(item) {
    return $(item).parents('form:first')
  }
  
  var options = $.extend({
        //'onUploadSuccess': on_upload_success,
        'add': add,
        //'progress': progress,
        'fail': fail,
        'done': done,
        'stop': stop,
        //'onUploadError': on_upload_error,
        //'onUploadCancel': on_upload_cancel,
        'autoUpload': true,
        'multi': false,
        //'removeCompleted': false,
        //'uploadLimit': 1,
        'async': true,
        'type': 'POST',
        'dataType': 'text', //since we use iframe, we force as text then parse as json later
        'forceIframeTransport': true,
        'url': '/hyper-admin/-storages/media/add/',
        'paramName': 'upload',
        'accepts': {
          'json': App.contentType, //custom media type defintion
        },
        'headers': {
            'Accept': App.contentType,
            //'Content-Type': 'multipart/form-data'
            //'Content-Type': 'text/html'
        }
    }, options);
    field.fileupload(options);
}
