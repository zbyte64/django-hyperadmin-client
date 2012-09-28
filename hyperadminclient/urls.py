from django.conf.urls.defaults import patterns, include, url
import hyperadmin
from hyperadminclient.clients import HyperAdminClient

admin_client = HyperAdminClient(api_endpoint=hyperadmin.site)

urlpatterns = patterns('',
    url(r'^', include(admin_client.urls)),
)

