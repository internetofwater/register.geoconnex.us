# =================================================================
#
# Author: Benjamin Webb <bwebb@lincolninst.edu>
#
# Copyright (c) 2024 Center for Geospatial Solutions
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

import click
from flask import (Blueprint, Flask, request,
                   stream_with_context, Response, send_from_directory)
from jinja2.environment import TemplateStream
import logging
import os

from pygeoregister.api import API
from pygeoregister.util import yaml_load

LOGGER = logging.getLogger(__name__)


if 'PYGEOREGISTER_CONFIG' not in os.environ:
    raise RuntimeError('PYGEOREGISTER_CONFIG environment variable not set')

with open(os.environ.get('PYGEOREGISTER_CONFIG'), encoding='utf8') as fh:
    CONFIG = yaml_load(fh)

STATIC_FOLDER = 'static'
if 'templates' in CONFIG['server']:
    STATIC_FOLDER = CONFIG['server']['templates'].get('static', 'static')


APP = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='/static')
APP.url_map.strict_slashes = False
BLUEPRINT = Blueprint('pygeoregister', __name__, static_folder=STATIC_FOLDER)

API_ = API(CONFIG)


def get_response(result: tuple):
    """
    Creates a Flask Response object and updates matching headers.
    :param result: The result of the API call.
                   This should be a tuple of (headers, status, content).
    :returns: A Response instance.
    """

    headers, status, content = result
    if isinstance(content, TemplateStream):
        response = Response(stream_with_context(content), status)
    else:
        response = Response(content, status)

    if headers:
        response.headers = headers
    return response

@BLUEPRINT.route('/favicon.ico')
def favicon():
    return send_from_directory(STATIC_FOLDER / 'img' , 'favicon.ico',
                               mimetype='image/vnd.microsoft.icon')

@BLUEPRINT.route('/')
def home():
    """
    Root endpoint

    :returns: HTTP response
    """
    return get_response(API_.landing_page(request))


APP.register_blueprint(BLUEPRINT)

@click.command()
@click.pass_context
@click.option('--debug', '-d', default=False, is_flag=True, help='debug')
def serve(ctx, server=None, debug=False):
    """
    Serve pygeoapi via Flask. Runs pygeoapi
    as a flask server. Not recommend for production.

    :param server: `string` of server type
    :param debug: `bool` of whether to run in debug mode

    :returns: void
    """

    # setup_logger(CONFIG['logging'])
    APP.run(debug=True, host=API_.config['server']['bind']['host'],
            port=API_.config['server']['bind']['port'])