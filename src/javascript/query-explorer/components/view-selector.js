// Copyright 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/* global gapi */


import React from 'react';
import ReactDOM from 'react-dom';
import AlertDispatcher from '../../components/alert-dispatcher';
import '../../embed-api/components/view-selector2';


/**
 * To fit the style of the page, customize the view selector template.
 */
const VIEW_SELECTOR_TEMPLATE =
    '<div class="FormControl FormControl--inline">' +
    '  <label class="FormControl-label">Account</label>' +
    '  <div class="FormControl-body">' +
    '    <select class="FormField"></select>' +
    '  </div>' +
    '</div>' +
    '<div class="FormControl FormControl--inline">' +
    '  <label class="FormControl-label">Property</label>' +
    '  <div class="FormControl-body">' +
    '    <select class="FormField"></select>' +
    '  </div>' +
    '</div>' +
    '<div class="FormControl FormControl--inline">' +
    '  <label class="FormControl-label">View</label>' +
    '  <div class="FormControl-body">' +
    '    <select class="FormField"></select>' +
    '  </div>' +
    '</div>';


export default class ViewSelector extends React.Component {

  /**
   * React lifecycyle method below:
   * http://facebook.github.io/react/docs/component-specs.html
   * ---------------------------------------------------------
   */

  componentDidMount() {

    gapi.analytics.ready(() => {

      this.viewSelector_ = new gapi.analytics.ext.ViewSelector2({
        container: ReactDOM.findDOMNode(this),
        ids: this.props.ids,
        template: this.props.template || VIEW_SELECTOR_TEMPLATE
      });

      this.viewSelector_.on('viewChange', (...args) => {
        this.hasSuccessfullyShownView_ = true;
        this.props.onChange.apply(this, args);
      });

      this.viewSelector_.on('error', (err) => {
        // If an error happens on the first render and is about not having
        // access to a particular view, just show the default view and assume
        // it's because someone shared a report to someone else without access.
        if (err.message.includes('access')) {
          if (!this.hasSuccessfullyShownView_) {
            this.viewSelector_.set({ids: undefined}).execute();
          }
        }
        // For all other errors, display an alert message.
        else {
          AlertDispatcher.addOnce({
            title: 'Oops, there was an error',
            message: err.message
          });
        }
      });

      this.viewSelector_.execute();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ids != this.props.ids && this.viewSelector_) {
      this.viewSelector_.set({ids: nextProps.ids}).execute();
    }
  }

  componentWillUnmount() {
    if (this.viewSelector_) this.viewSelector_.off();
  }

  render() {
    return (
      <div dangerouslySetInnerHTML={{__html: VIEW_SELECTOR_TEMPLATE}} />
    );
  }
}
