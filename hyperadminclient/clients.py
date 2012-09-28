from hyperadmin.clients.mediatype import MediaTypeClient

from hyperadminclient.mediatypes import AdminHtml5MediaType

class HyperAdminClient(MediaTypeClient):
    media_types = [AdminHtml5MediaType]

