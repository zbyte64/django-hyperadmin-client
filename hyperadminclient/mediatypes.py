from hyperadmin.mediatypes.html5 import Html5MediaType

class AdminHtml5MediaType(Html5MediaType):
    default_namespace = 'adminhtmlclient'
    template_name = 'hyperadminclient/resource.html'
    template_dir_name = 'hyperadminclient'
    
    def get_template_names(self):
        ret = super(AdminHtml5MediaType, self).get_template_names()
        print ret
        return ret

