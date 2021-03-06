import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Interpolate extends Component {

  constructor(props, context) {
    super(props, context);
    this.i18n = context.i18n;
    this.t = context.t;
  }

  render() {
    const parent = this.props.parent || 'span';
    const REGEXP = this.props.regexp || this.i18n.services.interpolator.regexp;
    const { className, style } = this.props;

    // Set to true if you want to use raw HTML in translation values
    // See https://github.com/i18next/react-i18next/issues/189
    const useDangerouslySetInnerHTML = this.props.useDangerouslySetInnerHTML || false;
    const dangerouslySetInnerHTMLPartElement = this.props.dangerouslySetInnerHTMLPartElement || 'span';

    const tOpts = { ...{}, ...this.props.options, ...{ interpolation: { prefix: '#$?', suffix: '?$#' } } };
    const format = this.t(this.props.i18nKey, tOpts);

    if (!format || typeof format !== 'string') return React.createElement('noscript', null);

    const children = [];

    const handleFormat = (key, props) => {
      if (key.indexOf(this.i18n.options.interpolation.formatSeparator) < 0) {
        if (props[key] === undefined) this.i18n.services.logger.warn(`interpolator: missed to pass in variable ${key} for interpolating ${format}`);
        return props[key];
      }

      const p = key.split(this.i18n.options.interpolation.formatSeparator);
      const k = p.shift().trim();
      const f = p.join(this.i18n.options.interpolation.formatSeparator).trim();

      if (props[k] === undefined) this.i18n.services.logger.warn(`interpolator: missed to pass in variable ${k} for interpolating ${format}`);
      return this.i18n.options.interpolation.format(props[k], f, this.i18n.language);
    };

    format.split(REGEXP).reduce((memo, match, index) => {
      let child;

      if (index % 2 === 0) {
        if (match.length === 0) return memo;
        if (useDangerouslySetInnerHTML) {
          child = React.createElement(dangerouslySetInnerHTMLPartElement, { dangerouslySetInnerHTML: { __html: match } });
        } else {
          child = match;
        }
      } else {
        child = handleFormat(match, this.props);
      }

      memo.push(child);
      return memo;
    }, children);

    return React.createElement.apply(this, [parent, { className, style }].concat(children));
  }
}

Interpolate.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

Interpolate.contextTypes = {
  i18n: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
};

export default Interpolate;
