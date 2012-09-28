============
Introduction
============

django-hyperadmin-client is a template based client for hyperadmin

------------
Requirements
------------

* Python 2.6 or later
* Django 1.3 or later
* django-hyperadmin


============
Installation
============

Put 'hyperadminclient' into your ``INSTALLED_APPS`` section of your settings file.

Add to your root url patterns::

    url(r'^hyper-admin/', include('hyperadminclient.urls')),

