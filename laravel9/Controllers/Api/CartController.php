<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\{CartCheckoutRequest, CartRequest, CartDeleteRequest};
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Cart;
use App\Traits\{ApiLogTrait, CartTrait, CouponCodeTrait};
use Symfony\Component\HttpFoundation\Response as ResponseStatus;

class CartController extends Controller
{
    use ApiLogTrait, CartTrait, CouponCodeTrait;

    /**
     * @OA\Get(
     *      path="/api/cart",
     *      operationId="show_carts",
     *      tags={"Cart APIs"},
     *      summary="APIs for show user Cart details",
     *      description="API for show user Cart details",
     *      security={{"bearer_token":{}}},
     *  @OA\Parameter(
     *      name="Accept",
     *      in="header",
     *      description="Accept",
     *      required=true,
     *      example="application/json",
     *      schema={
     *          "type"="string"
     *      },
     *      style="form",
     *   ),
     *  @OA\Parameter(
     *      name="coupon_code",
     *      in="query",
     *      description="Coupon code",
     *      required=true,
     *      example="FLAT10",
     *      schema={
     *          "type"="string"
     *      },
     *      style="form",
     *   ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=400,
     *          description="Bad Request",
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      )
     *  )
     */
    public function index(CartCheckoutRequest $request)
    {
        $status = ResponseStatus::HTTP_OK;
        $response = [];

        try {
            $requestData = $request->validated();

            $couponCode = ($request->has('coupon_code')) ? $requestData['coupon_code'] : null;
            
            $response = [
                'status' => true,
                'data' => $this->getCartData($couponCode),
                'response' => $status
            ];
        } catch (\Throwable $th) {
            $status = $th->getCode();

            $response = [
                'status' => false,
                'message' => $th->getMessage(),
                'response' => $status
            ];

            /* log issue */
            $this->_log_api_error(null, $request, $response);

            throw $th;
        }

        return response($response, $status);
    }


    /**
     * @OA\post(
     *      path="/api/cart/save",
     *      operationId="cart_save",
     *      tags={"Cart APIs"},
     *      summary="APIs for show user Cart details",
     *      description="API for show user Cart details",
     *      security={{"bearer_token":{}}},
     *  @OA\Parameter(
     *      name="Accept",
     *      in="header",
     *      description="Accept",
     *      required=true,
     *      example="application/json",
     *      schema={
     *          "type"="string"
     *      },
     *      style="form",
     *   ),
     *      @OA\RequestBody(
     *       required=true,
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="object",
     *               @OA\Property(
     *                   property="items",
     *                   description="",
     *                   type="array",
     *                   @OA\Items(
     *                      @OA\Property(
     *                          property="download_id",
     *                          description="",
     *                          type="integer",
     *                      ),
     *                      @OA\Property(
     *                          property="download_package_id",
     *                          description="",
     *                          type="integer",
     *                      )
     *                     )
     *                  )
     *               
     *              )
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=400,
     *          description="Bad Request",
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      )
     *  )
     */
    public function save(CartRequest $request): Response
    {
        $status = ResponseStatus::HTTP_OK;
        $response = [];

        try {
            $requestData = $request->validated();

            $user = Auth::user();

            foreach ($requestData['items'] as $item) {
                $cart = new Cart;

                $cart->user_id = $user->id;
                $cart->download_id = $item['download_id'];
                $cart->download_package_id = (isset($item['download_package_id'])) ? $item['download_package_id'] : NULL;

                $cart->save();
            }

            $response = [
                'status' => true,
                'message' => __('messages.cart_save'),
                'data' => $this->getCartData(),
                'response' => $status
            ];
        } catch (\Throwable $th) {
            $status = $th->getCode();

            $response = [
                'status' => false,
                'message' => $th->getMessage(),
                'response' => $status
            ];

            /* log issue */
            $this->_log_api_error(null, $request, $response);

            throw $th;
        }

        return response($response, $status);
    }

    /**
     * @OA\post(
     *      path="/api/cart/remove",
     *      operationId="cart_delete",
     *      tags={"Cart APIs"},
     *      summary="APIs for show user Cart details",
     *      description="API for show user Cart details",
     *      security={{"bearer_token":{}}},
     *  @OA\Parameter(
     *      name="Accept",
     *      in="header",
     *      description="Accept",
     *      required=true,
     *      example="application/json",
     *      schema={
     *          "type"="string"
     *      },
     *      style="form",
     *   ),
     *  @OA\RequestBody(
     *       required=true,
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="object",
     *               @OA\Property(
     *                   property="cart_id",
     *                   description="cart id",
     *                   type="number",
     *                   example="1"
     *                  ),
     *              )
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=400,
     *          description="Bad Request",
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      )
     *  )
     */
    public function delete(CartDeleteRequest $request)
    {

        $status = ResponseStatus::HTTP_OK;
        $response = [];

        try {
            $cart_id = $request->cart_id;

            $cart_item = Cart::where(['id' => $cart_id, 'user_id' => Auth::id()])->pluck('id')->first();

            if ($cart_item) {
                Cart::whereId($cart_id)->delete();
            } else {
                throw new \Symfony\Component\HttpKernel\Exception\BadRequestHttpException(__('messages.invalid_request'));
            }

            $response = [
                'status' => true,
                'message' => __('messages.cart_delete'),
                'data' => $this->getCartData(),
                'response' => $status
            ];
        } catch (\Throwable $th) {
            $status = $th->getCode();

            $response = [
                'status' => false,
                'message' => $th->getMessage(),
                'response' => $status
            ];

            /* log issue */
            $this->_log_api_error(null, $request, $response);

            throw $th;
        }
        return response($response, $status);
    }

    /* Get user cart data */
    private function getCartData($couponCode = null)
    {
        $user = Auth::user();

        list($cart_items, $subtotal) = $this->_get_user_cart_data($user->id);

        $discount = $this->_calculate_discount($couponCode, $subtotal);
        unset($discount['id']);

        $discount_price = 0;
        if (isset($discount['price'])) {
            $discount_price = $discount['price'];
        }

        return [
            'cart_items'    => $cart_items,
            'discount'      => $discount,
            'subtotal'      => (float) $subtotal,
            'total'         => (float) ($subtotal - $discount_price),
        ];
    }
}
