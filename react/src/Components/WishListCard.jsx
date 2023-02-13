import React from 'react'
import { Link } from 'react-router-dom';
import image from "../assets/placeholder.png"


function WishListCard({ item }) {
   
    
    return (
        <>
            <Link className="collection--multiimg-box"  to={`/wish-lists/view/${item.id}`}>
                <div className="collection--multiimg-box-img">
                    <div className="collection--multiimg-left">
                        <img src={item?.active_downloads?.length > 0 ? item?.active_downloads[0]?.watermarked_file?.file : image} alt='collection-img' />
                    </div>
                    <div className="collection--multiimg-right">
                        <div className="collection--multiimg-right-top">
                            <img src={item?.active_downloads?.length > 1 ? item?.active_downloads[1]?.watermarked_file?.file : image} alt='collection-img' />
                        </div>
                        <div className="collection--multiimg-right-bottom">
                            <img src={item?.active_downloads?.length > 2 ? item?.active_downloads[2]?.watermarked_file?.file : image} alt='collection-img' />
                        </div>
                    </div>
                </div>
                <div className="collection--multiimg-view">
                    <Link
                        to={`/wish-lists/view/${item.id}`}
                    >{item.name}</Link>
                    <Link
                        to={`/wish-lists/edit/${item.id}`}

                    >Edit</Link>
                </div>
            </Link>
        </>
    )
}

export default WishListCard;