import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom'; // Ensure 'Link' is correctly imported
import add_product_icon from '../../../assets/Product_Cart.svg';
import list_product_icon from '../../../assets/Product_list_icon.svg';

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to={'/addproduct'} style={{ textDecoration: 'none' }}> {/* Use capital 'Link' */}
        <div className="sidebar-item">
          <img src={add_product_icon} alt="Add Product Icon" />
          <p>Add Product</p>
        </div>
      </Link>

      <Link to={'/listproduct'} style={{ textDecoration: 'none' }}> {/* Use capital 'Link' */}
        <div className="sidebar-item">
          <img src={list_product_icon} alt="Add Product Icon" />
          <p>Product List</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
