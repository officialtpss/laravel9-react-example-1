import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import SimpleBackdrop from '../components/Backdrop'
import StripePayment from '../components/Payment/StripePayment'
import TitleBanner from '../components/TitleBanner'
import { errorMessage, successMessage } from '../helpers/Message'
import { getDataRedux } from '../redux/slices/cartSlice'
import instance from '../services/apiServices/Api'
import Storage from '../services/locaol_storage/localStorage'

function CheckOut() {

    const navigate = useNavigate()
    const token = Storage.getToken();
    const userData = Storage.getUserData()
    const localCart = Storage.getCartData();


    const [paymentOptions, setPaymentOptions] = useState([])
    const [paymentMethod, setPaymentMethod] = useState({})
    const [paymentKey, setPaymentKey] = useState()
    const [couponCode, setCouponCode] = useState('')
    const [showing, setShowing] = useState(false)
    const [loadButton, setLoadButton] = useState(false)
    const [loading, setLoading] = useState(false)
    let paypalData = {}

    const striperef = useRef();

    const stripePromise = paymentMethod?.provider === "stripe" && paymentKey ? loadStripe(paymentKey) : null;

    const dispatch = useDispatch();
    const titleBanner = {
        title: "Checkout",
        breadCrumbs: "Checkout",
        link: "/"
    }

    let cartData = useSelector((state) => state.addToCart.dataOfCart)
    // const cartData = cartData1.cart_items; 
    // console.log("cartData1, ", cartData1)  
    // const cartDiscount = cartData1.discount;   

    let result = cartData?.cart_items?.map(item => item?.download_package?.price * 100 / 100).reduce((prev, next) => prev + next, 0);

    useEffect(() => {
        dispatch(getDataRedux())
        if (token) {
            getPaymentMethods()
        }
        // eslint-disable-next-line
    }, [])

    const RemoveItem = (id) => {
        Swal.fire({
            title: 'Do you want to delete this product?',
            showConfirmButton: false,
            showDenyButton: true,
            showCancelButton: true,
            denyButtonText: `Yes`,
        }).then((result) => {
            if (result.isDenied) {
                if (!token) {
                    localCart.cart_items.splice(id, 1);
                    Storage.SetCartData(localCart);
                    successMessage("Cart item deleted successfully")
                    dispatch(getDataRedux())
                } else {
                    instance.post('/cart/remove', { cart_id: id }, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then((res) => {
                        successMessage("Cart item deleted successfully")
                        dispatch(getDataRedux())
                    })
                }
            }
        })
    }
    const getPaymentMethods = () => {
        instance.get("/get-payment-methods", {
            headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
            setPaymentOptions(res.data.data)
        })
    }

    const decrypted = (pkey) => {
        var CryptoJS = require('crypto-js');
        var Base64 = require('js-base64').Base64;
        var key = process.env.REACT_APP_DECRYPT_KEY;
        var data = pkey;

        let encrypted_json = JSON.parse(Base64.decode(data));

        // Now I try to decrypt it.
        var decrypted = CryptoJS.AES.decrypt(encrypted_json.value, CryptoJS.enc.Base64.parse(key), {
            iv: CryptoJS.enc.Base64.parse(encrypted_json.iv)
        });
        setPaymentKey(decrypted.toString(CryptoJS.enc.Utf8));
    }

    const ApplyCoupon = async () => {
        setLoading(true)
        if (couponCode !== "") {
            await instance.post('/checkCouponCode', { coupon_code: couponCode }, {
                headers: { Authorization: `Bearer ${token}` }
            }).then((res) => {
                //console.log(res)
                if (res.status === 200) {
                    dispatch(getDataRedux(couponCode))
                    setShowing(true)
                }


            }).catch((err) => {
                //console.log(err)
                errorMessage("Error", err?.response?.data?.message)
            })
            setLoading(false);
        } else {
            setLoading(false);
            errorMessage("Error", "Please enter coupon code")
        }

    }

    const PurchaseItem = async () => {
        setLoading(true)

        if (token) {
            if (result === 0) {
                instance.post(`${couponCode ? '/orders?coupon_code=' + couponCode : "/orders"}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then((res) => {
                    setLoading(false)
                    successMessage('Success', "Order placed successfully").then(() => navigate('/checkout/purchase-confirmation', { state: { order_id: res.data.data.id } }))
                }).catch((err) => {
                    setLoading(false);
                    errorMessage("Error", err.response.data.message)
                });
            } else {
                if (paymentMethod.provider === "stripe") {
                    // console.log("Stripe Called", stripePromise);
                    striperef.current.handelSubmit()
                }
                else {
                    setLoading(false)
                    errorMessage("Error", "Please Select Payment Method")
                }

            }

        } else {
            setLoading(false)
            errorMessage("Error", "Login To Continue").then(() => {
                navigate("/login", { state: { url_slug: "/checkout" } })
            })
        }
    }
    const getStripeToken = (value) => {
        setLoading(true)
        if (value) {
            instance.post(`${couponCode ? '/orders?coupon_code=' + couponCode : "/orders"}`, {
                pm_id: paymentMethod?.id,
                token: value?.id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            }).then((res) => {
                setLoading(false)
                successMessage('Success', "Order placed successfully").then(() => navigate('/checkout/purchase-confirmation', { state: { order_id: res.data.data.id } }))
            }).catch((err) => {
                setLoading(false);
                errorMessage("Error", err.response.data.message)
            });
        }
        else {
            setLoading(false);
            errorMessage("Error", "Please enter card details")
        }

    }
    const payPalOrder = async () => {
        setLoading(true)
        if (paymentMethod) {
            await instance.post(`${couponCode ? '/orders?coupon_code=' + couponCode : "/orders"}`, { pm_id: paymentMethod?.id, }, {
                headers: { Authorization: `Bearer ${token}` }
            }).then((res) => {
                paypalData = { ...res.data.data }
            }).catch((err) => {
                errorMessage("Error", err.message)
            })
        }
        else {
            errorMessage('Error', 'Please select paymentmethod')
        }
    }
  
    return (
        <>
            {
                loading && <SimpleBackdrop />
            }
            <TitleBanner item={titleBanner} />
            {cartData.download_id}
            <div className="checkout-main min-h-empty">
                <div className="container">
                    {
                        cartData?.cart_items?.length < 1 ? <h1 className='text-center'>Cart is Empty</h1>
                            :
                            <>
                                <div className="checkout-wrap-outer">
                                    <div className="checkout-wrap">
                                        <div className="checkout-row checkout-header">
                                            <div className="checkout-clm ">
                                                <p>Name</p>
                                            </div>
                                            <div className="checkout-clm">
                                                <p>Item Price</p>
                                            </div>
                                            <div className="checkout-clm">
                                                <p>Action</p>
                                            </div>
                                        </div>
                                        <div className="checkout-content">
                                            {
                                                cartData?.cart_items?.length > 0 && cartData.cart_items.map((item, i) =>
                                                    <div className="checkout-row " key={i}>
                                                        <div className="checkout-clm ">
                                                            <div className="checkout-cnt-image">
                                                                <div className="checkout-cnt-inner-image"> <img src={item?.download?.type === "video" ? item?.download?.watermarked_file?.file : item?.download?.watermarked_file_small?.file} alt="" />
                                                                </div>
                                                                <p className="checkout-title">{item?.download?.title} -{item?.download_package?.package?.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="checkout-clm">
                                                            <p className="checkout-price">{item?.download_package?.price === 0 ? "Free" : `$ ${token ? item?.price : item?.download_package?.price}`}</p>
                                                        </div>
                                                        <div className="checkout-clm">
                                                            <div className="checkout-delete">
                                                                <span onClick={() => RemoveItem(localCart.length > 0 ? i : item.id)}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" /></svg>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>

                                        <div className="checkout-row checkout-action">

                                            <div className="checkout-clm ">
                                                <Link className="btn purple-btn" to={'/'}>Continue Shopping</Link>
                                            </div>

                                            <div className="checkout-clm">
                                                <p className="checkout-total-amount checkout_subtotal" style={{ display: (showing ? 'flex' : 'none') }}><label>SubTotal:</label> ${cartData.subtotal}</p>
                                                <p className="checkout-total-amount checkout_discount_type" style={{ display: (showing ? 'flex' : 'none') }}><label>Coupon Type:</label> {cartData?.discount?.type}</p>
                                                <p className="checkout-total-amount checkout_discount" style={{ display: (showing ? 'flex' : 'none') }}><label>Discount:</label> ${cartData?.discount?.price}</p>
                                                <p className="checkout-total-amount checkout_total"><label>Total:</label> ${token ? cartData.total : result}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="checkout-payment-info coupon-code-wrap">
                                    <div className="checkout-payment-method">
                                        <h2 className="checkout-payment-title">Coupon Code</h2>
                                        <div className="coupon_div">
                                            <input className="inputField" name="coupon_code" type="text"
                                                placeholder='Enter Coupon Code' onChange={(e) => setCouponCode(e.target.value)} />
                                            <button className="btn primary-btn" onClick={() => ApplyCoupon()}>Apply Coupon</button>
                                        </div>
                                    </div>
                                </div>
                                {token && result > 0 &&
                                    <div className="checkout-payment-info">

                                        <div className="checkout-payment-method">

                                            <h2 className="checkout-payment-title">Select payment method</h2>
                                            <div className="checkout-payment-row">
                                                {
                                                    paymentOptions?.length > 0 && paymentOptions.map((item, i) =>
                                                        <div className="field-outer radio-outer" key={i}>
                                                            <input type="radio" name="Payment_method" value={item?.id}
                                                                onChange={(e) => {
                                                                    if (item.provider === "stripe") {
                                                                        setPaymentMethod({ id: e.target.value, pkey: item?.pkey, provider: item?.provider })
                                                                        decrypted(item.pkey)
                                                                    }
                                                                    else {
                                                                        setPaymentMethod({ id: e.target.value, pc: item?.pc, provider: item?.provider })
                                                                        decrypted(item.pc)
                                                                    }
                                                                }}
                                                            />
                                                            <label className="payment-radiobtn" htmlFor="styled-radio">{item?.name}</label>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                            <Elements stripe={stripePromise}>
                                                {paymentMethod.provider === "stripe" && <StripePayment ref={striperef} item={getStripeToken} />}
                                            </Elements>
                                        </div>
                                    </div>
                                }
                                <div className="checkout-payment-info checkout-person-info">
                                    <div className="checkout-payment-method">
                                        <h2 className="checkout-payment-title">Personal info</h2>
                                        <div className="payment-card-info">
                                            <div className="d-flex payment-card">

                                                <div className="field-outer">
                                                    <label>Email address<span>*</span></label>
                                                    <p>We will send the purchase receipt to this address.</p>
                                                    <input className="inputField" type="email" defaultValue={userData?.email} placeholder="enter email address" disabled />
                                                </div>

                                                <div className="field-outer">
                                                    <label>First name<span>*</span></label>
                                                    <p>We will use this to personalize your account experience.</p>
                                                    <input className="inputField" type="text" defaultValue={userData?.first_name} placeholder="First name" disabled />
                                                </div>

                                                <div className="field-outer">
                                                    <label>Last name<span>*</span></label>
                                                    <p>We will use this to personalize your account experience.</p>
                                                    <input className="inputField" type="text" defaultValue={userData?.last_name} placeholder="Last name" disabled />
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between purchase-info-total">

                                                <p className="purchaseTotal">Purchase Total: ${token ? cartData.total : result}.00</p>
                                                {
                                                    paymentMethod.provider === "paypal" ?
                                                        <PayPalScriptProvider options={{ "client-id": paymentKey }}>
                                                            <div className="paypal-wrap">
                                                                <button className="btn primary-btn" disabled={loadButton ? false : true}>{loadButton ? "Purchase" : "Loading..."}</button>
                                                                <PayPalButtons
                                                                    className={loadButton ? 'bt2' : 'bt2 bt2-disable'}
                                                                    style={{ layout: "horizontal", color: "black", label: "pay", height: 55 }}
                                                                    onInit={() => setLoadButton(true)}
                                                                    createOrder={async (data, actions, err) => {
                                                                        await payPalOrder()
                                                                        return actions.order.create({
                                                                            intent: "CAPTURE",
                                                                            payer: {
                                                                                name: {
                                                                                    given_name: paypalData?.first_name,
                                                                                    surname: paypalData?.last_name
                                                                                },
                                                                                // address: {
                                                                                //     address_line_1: paypalData?.address_line_1 ,
                                                                                //     address_line_2: paypalData?.address_line_2,
                                                                                //     admin_area_1: paypalData?.state,
                                                                                //     admin_area_2: paypalData?.city,
                                                                                //     postal_code: paypalData?.zipcode,
                                                                                //     country_code: paypalData?.country,
                                                                                // },
                                                                                email_address: paypalData?.email,
                                                                                // phone: {
                                                                                //     phone_type: "MOBILE",
                                                                                //     phone_number: {
                                                                                //         national_number: "7018916211"
                                                                                //     }
                                                                                // }
                                                                            },
                                                                            purchase_units: [
                                                                                {
                                                                                    descripton: "Stripe Payments",
                                                                                    reference_id: paypalData?.id, //orderid,
                                                                                    amount: {
                                                                                        currency_code: "USD",
                                                                                        value: paypalData?.total
                                                                                    }
                                                                                }
                                                                            ]
                                                                        })
                                                                    }}
                                                                    onApprove={async (data, actions) => {
                                                                        await actions.order.capture()
                                                                            .then((res) => {
                                                                                instance.post('/orders/transaction', {
                                                                                    order_id: paypalData?.id,
                                                                                    transaction: res
                                                                                }, {
                                                                                    headers: { Authorization: `Bearer ${token}` }
                                                                                })
                                                                                setLoading(false)
                                                                                successMessage('Success', res.message)
                                                                                if (res.status === "COMPLETED") {
                                                                                    navigate('/checkout/purchase-confirmation', { state: { order_id: paypalData.id } });
                                                                                }
                                                                            })
                                                                            .catch((err) => {
                                                                                setLoading(false)
                                                                                errorMessage('Error', err.message)
                                                                            })

                                                                    }}
                                                                    onCancel={(data, actions) => {
                                                                        // console.log(data);
                                                                        // console.log("--");
                                                                        // console.log(actions);
                                                                        setLoading(false)
                                                                        errorMessage('Error', 'Transaction is canceled')
                                                                    }}
                                                                    onError={(data, actions) => {
                                                                        setLoading(false)
                                                                        errorMessage('Error', 'Something went wrong')
                                                                        // console.log(data);
                                                                        // console.log("--");
                                                                        // console.log(actions);
                                                                    }}
                                                                />
                                                            </div>
                                                        </PayPalScriptProvider>

                                                        : <button className="btn primary-btn" disabled={paymentMethod ? false : true} onClick={PurchaseItem}>{cartData.total === 0 ? "Free Download" : "Purchase"}</button>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                    }
                </div>
            </div>
        </>
    )
}

export default CheckOut