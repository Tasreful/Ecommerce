import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../../assets/upload_area.svg';

const AddProduct = () => {
  const [image, setImage] = useState(null); // Initializing state as null instead of false
  const [productDetails,setProductDetails] = useState({
    name:"",
    image:"",
    category:"women",
    new_price:"",
    old_price:""
  })

  const imageHandler = (e) => {
    setImage(e.target.files[0]); // Set the uploaded image file
  };

  const changeHandler = (e) =>{
    setProductDetails({...productDetails,[e.target.name]:e.target.value})
  }

  const Add_Product = async () =>{
    // console.log(productDetails);
    let responseData;
    let product = productDetails;
    console.log(product);
    

    let formData = new FormData();
    formData.append('product',image);

    await fetch('http://localhost:4000/upload',{
        method:'POST',
        headers:{
            Accept:'application/json',

        },
        body:formData,
    }).then((resp) =>resp.json()).then((data)=>{responseData=data});

    if(responseData.success)
    {
        product.image = responseData.image_url;
        console.log(product);
        await fetch('http://localhost:4000/addproduct',{
          method:'POST',
        headers:{
            Accept:'application/json',
            'Content-Type':'application/json',

        },
        body:JSON.stringify(product),
        }).then((resp)=>resp.json()).then((data)=>{
          data.success?alert("Product Added"):alert("Failed")
        })
    }
  }

  return (
    <div className='add-product'>
      {/* Product Title */}
      <div className="addproduct-itemfield addproduct-title">
        <p>Product Title</p>
        <input value={productDetails.name} onChange={changeHandler} type="text" name="name" placeholder='Type here' />
      </div>

      {/* Price and Offer Price */}
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input value={productDetails.old_price} onChange={changeHandler} type="text" name="old_price" placeholder='Type here'/>
        </div>

        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input value={productDetails.new_price} onChange={changeHandler}  type="text" name="new_price" placeholder='Type here'/>
        </div>
      </div>

      {/* Product Category */}
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select value={productDetails.category} onChange={changeHandler}   name="category" className='add-product-selector'>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>

      {/* File Upload Section */}
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            className='addproduct-thumnail-img'
            alt="Upload area"
          />
        </label>
        <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
      </div>

      {/* Submit Button */}
      <button onClick={()=>{Add_Product()}} className='addproduct-btn'>ADD</button>
    </div>
  );
};

export default AddProduct;