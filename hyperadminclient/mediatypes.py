from hyperadmin.mediatypes.html5 import Html5MediaType

class AdminHtml5MediaType(Html5MediaType):
    default_namespace = 'adminhtmlclient'
    template_name = 'hyperadminclient/resource.html'
    template_dir_name = 'hyperadminclient'
    
    def get_context_data(self, link, state):
        context = super(AdminHtml5MediaType, self).get_context_data(link, state)
        context['tool_links'] = state.links.get_outbound_links()
        context['breadcrumbs'] = state.links.get_breadcrumbs()
        if state.get('view_classes', None):
            context['body_class'] = ' '.join(state['view_classes'])
        return context
    
    def get_change_list_context_data(self, link, state, context):
        context['pagination_links'] = state.links.get_pagination_links()
        context['filter_links'] = dict()
        
        filter_links = state.links.get_filter_links()
        for link in filter_links:
            section = link.cl_headers.get('group', link.prompt)
            context['filter_links'].setdefault(section, [])
            context['filter_links'][section].append(link)
        return context
        
