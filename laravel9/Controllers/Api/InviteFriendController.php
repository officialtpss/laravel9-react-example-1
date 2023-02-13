<?php

namespace App\Http\Controllers\Api;

use App\Events\InviteFriendEvent;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Api\InviteFriendsRequest;
use App\Models\Invite;
use Illuminate\Support\Facades\Auth;
use App\Traits\ApiLogTrait;
use Symfony\Component\HttpFoundation\Response as ResponseStatus;
use App\Interfaces\InviteFriendStatusInterface;


class InviteFriendController extends Controller
{

    use ApiLogTrait;

    /**
     * @OA\Post(
     *      path="/api/invite_friend",
     *      operationId="invite_friend",
     *      tags={"Invite User APIs"},
     *      summary="",
     *      description="",
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
     *   @OA\RequestBody(
     *       required=true,
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="object",
     *               @OA\Property(
     *                   property="name",
     *                   description="Name of Invited User",
     *                   type="integer",
     *                   example="xyz abd"
     *                  ),
     *              @OA\Property(
     *                   property="email",
     *                   description="Enter Email of invited user",
     *                   type="string",
     *                   example="abc@xyz.com"
     *                  ),
     *              )
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Success",
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
     *     )
     */
    public function update(InviteFriendsRequest $request)
    {
        $status = ResponseStatus::HTTP_NOT_FOUND;
        $response = [];

        
        try {
            $request->validated();
    
            $referCode = \Illuminate\Support\Str::random(10);
            
            $invite = new Invite;
            $invite->referred_user_id = Auth::id();
            $invite->name = $request->name;
            $invite->refer_code = $referCode;
            $invite->email = $request->email;
            $invite->status = InviteFriendStatusInterface::ACTIVE;

            $invite->save();

            $name = Auth::user()->first_name." ".Auth::user()->last_name;
            
            /* event Invite Friend*/
            event(new InviteFriendEvent($name,$invite));

            $status = ResponseStatus::HTTP_OK;

            $response = [
                'status' => true,
                'message' => 'Invite sent successfully',
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
}
