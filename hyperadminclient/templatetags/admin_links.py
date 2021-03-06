from django import template

from copy import copy


register = template.Library()

def tool_links(context, links):
    context = copy(context)
    context['tools'] = list()
    for link in links:
        if link.rel == 'breadcrumb':
            continue
        if link.get_link_factor() == "LT":
            try:
                cloned_links = link.clone_into_links()
            except Exception, error:
                print error
                cloned_links = []
            if cloned_links:
                context['tools'].append({'links':cloned_links, 'dropdown':True, 'prompt':link.prompt})
            else:
                context['tools'].append({'link':link, 'dropdown':False})
        else:
            context['tools'].append({'link':link, 'dropdown':False})
    return context

register.inclusion_tag('hyperadminclient/includes/tool_links.html', takes_context=True)(tool_links)
