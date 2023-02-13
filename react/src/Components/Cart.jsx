import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom'

function Cart() {
    const cartData = useSelector((state) => state.addToCart.dataOfCart)
    let sum = 0;
    return (

        (cartData?.cart_items?.length > 0) ?
            <ul className="navbar--submenu">
                <li className="navbar--submenu-content">
                    <div className="navbar--submenu-mega">
                        <div className="prodcuct-cart-menu">
                            <div className="pc-menu-wrap" >
                                {cartData?.cart_items?.map((item, index) => {
                                    sum += Math.round((parseFloat(item?.download_package?.price)) * 100) / 100;;
                                    return (
                                        <div onClick={() => window.location = `/downloads/${item?.download?.slug}`} className="pc-menu-row" key={index} >
                                            <img src={item?.download?.watermarked_file_small?.file}
                                                alt="" />
                                            <div className="pc-menu-column">
                                                <h2 className="pc-menu-title"> {item?.download?.title} </h2>
                                                <p>{item?.download_package?.price === 0 ? "Free" : '$' + item?.download_package?.price}</p>
                                            </div>
                                        </div>
                                    );
                                })

                                }
                            </div>

                            <div className="pc-menu-row pc-menu-footer">
                                <p className="cart-item">{cartData?.cart_items?.length} Items</p>
                                <p className="cart-total">Total: ${sum}</p>
                            </div>
                            <div className="pc-menu-row">
                                <Link id="RouterNavLink" className="btn primary-btn checkout-btn" to="/checkout">Checkout</Link>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
            :
            ""
    )
}

export default Cart;
