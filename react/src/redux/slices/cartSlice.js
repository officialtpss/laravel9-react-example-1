import { createSlice } from "@reduxjs/toolkit"
import { errorMessage } from "../../helpers/Message"
import instance from "../../services/apiServices/Api"
import Storage from "../../services/locaol_storage/localStorage"



const initialState = {
    dataOfCart: []
}


const addToCart = createSlice({
    name: "addToCart",
    initialState: initialState,
    reducers: {
        onCallCart: function (state, actoin) {
            state.dataOfCart = actoin.payload.dataOfCart
        }
    }
})

export function getDataRedux(couponCode) {

    return async dispatch => {
        const token = Storage.getToken()
        const localCart = Storage.getCartData();
        try {
            if (token) {
                if (localCart && localCart?.cart_items?.length > 0) {
                    let cartData = []
                    localCart?.cart_items?.map((item) =>
                        cartData.push({
                            download_id: item?.download_id,
                            download_package_id: item?.download_package?.id
                        })
                    )
                    if(cartData && cartData.length>0){
                    instance.post('/cart/save', { items: cartData }, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then((res) => {
                        if (res?.status === 200) {
                            cartData = []
                            Storage.removeData("cart")
                            instance.get(`${couponCode?'/cart?coupon_code='+couponCode:"/cart"}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }).then((res) => {
                                dispatch(onCallCart({ dataOfCart: res.data.data }))

                            })
                        }
                    }).catch((err) => {
                        errorMessage("Error",err.response.data.message)
                        // console.log(err);
                    })}
                } else {
                    instance.get(`${couponCode?'/cart?coupon_code='+couponCode:"/cart"}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then((res) => {

                        dispatch(onCallCart({ dataOfCart: res.data.data }))
                    })
                }
            } else {
                dispatch(onCallCart({ dataOfCart: localCart }))
            }
        } catch {
            errorMessage("Error","Somthing went wrong")
            // console.log("Error");
        }
    }

}

export const { onCallCart } = addToCart.actions;
export default addToCart.reducer