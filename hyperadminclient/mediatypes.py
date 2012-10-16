from hyperadmin.mediatypes.html5 import Html5MediaType

class AdminHtml5MediaType(Html5MediaType):
    default_namespace = 'adminhtmlclient'
    template_name = 'hyperadminclient/resource.html'
    template_dir_name = 'hyperadminclient'
    
    def get_context_data(self, link, state):
        context = super(AdminHtml5MediaType, self).get_context_data(link, state)
        context['breadcrumbs'] = [link for link in state.get_outbound_links() if link.rel == 'breadcrumb']
        return context
    
    def get_change_list_context_data(self, link, state, context):
        links = state.get_templated_queries()
        context['pagination_links'] = [link for link in links if link.rel == 'pagination']
        filter_links = dict()
        for link in links :
            if link.rel == 'filter':
                section = link.cl_headers.get('group', link.prompt)
                filter_links.setdefault(section, [])
                filter_links[section].append(link)
        context['filter_links'] = filter_links
        return context
        
