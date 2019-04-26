import React from "react"
import PropTypes from "prop-types"

const Layout = (props) => (
    <React.Fragment>
        <header>
            <div className="site-title">tools.smith-net.org.uk | <b>{props.title}</b></div>
        </header>
        <main>{props.children}</main>
    </React.Fragment>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
