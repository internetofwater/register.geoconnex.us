# =================================================================
#
# Author: Benjamin Webb <bwebb@lincolninst.edu>
#
# Copyright (c) 2024 Benjamin Webb
#
# Permission is hereby granted, free of charge, to any person
# obtaining a copy of this software and associated documentation
# files (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use,
# copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following
# conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
# OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
# OTHER DEALINGS IN THE SOFTWARE.
#
# =================================================================

from copy import deepcopy
from http import HTTPStatus
import logging
from typing import Any, Tuple, Union

from pygeoapi.api import APIRequest, FORMAT_TYPES, F_HTML, F_JSON, F_JSONLD
from pygeoapi.util import get_base_url, render_j2_template

from pygeoregister import __version__
from pygeoregister.log import setup_logger

from pygeoregister.util import (TEMPLATES, to_json,
                       url_join, stream_j2_template)

LOGGER = logging.getLogger(__name__)
HEADERS = {
    'X-Powered-By': f'pygeoregister {__version__}'
}
SPLIT_CATCHMENT_THRESHOLD = 200


def pre_process(func):
    """
    Decorator that transforms an incoming Request instance specific to the
    web framework (i.e. Flask, Starlette or Django) into a generic

    :class:`APIRequest` instance.

    :param func: decorated function

    :returns: `func`
    """

    def inner(*args):
        cls, req_in = args[:2]
        req_out = APIRequest.with_data(req_in, ['en-US'])
        if len(args) > 2:
            return func(cls, req_out, *args[2:])
        else:
            return func(cls, req_out)

    return inner


class API:
    """API object"""

    def __init__(self, cfg):
        """
        constructor

        :param cfg: cfg dict

        :returns: `pygeoregister.API` instance
        """
        self.config = cfg
        self.api_headers = HEADERS
        self.base_url = get_base_url(self.config)

        if 'templates' not in self.config['server']:
            self.config['server']['templates'] = {'path': TEMPLATES}

        if 'pretty_print' not in self.config['server']:
            self.config['server']['pretty_print'] = False

        self.pretty_print = self.config['server']['pretty_print']

        setup_logger(cfg['logging'])

    @pre_process
    def landing_page(self, request: Union[APIRequest, Any]
                     ) -> Tuple[dict, int, str]:
        """
        Provide API landing page

        :param request: A reaquest object

        :returns: tuple of headers, status code, content
        """
        LOGGER.debug('request recieved')
        if not request.is_valid():
            return self.get_exception(request)
        
        headers = request.get_response_headers(**HEADERS)

        content = {
            'title': self.config['metadata']['identification']['title'],
            'description': self.config['metadata']['identification']['description'],  # noqa
            'links': [{
                'rel': 'self',
                'type': 'application/json',
                'title': 'register.geoconnex.us',
                'href': f'{self.base_url}'
            }]
        }

        if request.format == F_HTML:
            content = render_j2_template(self.config, 'landing_page.html',
                            content, request.locale)
            return headers, HTTPStatus.OK, content
        else:
            return headers, HTTPStatus.OK, to_json(content, self.pretty_print)
