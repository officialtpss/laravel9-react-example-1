// import { Skeleton } from '@mui/material'
import React, { useState } from 'react'
import Masonry from 'react-masonry-css'
import { useNavigate } from 'react-router-dom'

import image from "../assets/placeholder.png"
import userLogo from "../assets/user-logo.png"
import img from '../assets/imagePlaceholder.jpg'


function ImageCard({ Data }) {
    const { pichaData, tabType } = Data
    const navigate = useNavigate()
    const [imgLoader, setLoader] = useState(false)
    const loader = () => { setLoader(true) }
    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1
    };

    const videoItems = pichaData.length > 0 && pichaData?.map(function (item, i) {
        return (
            <div className='contributorCardWrap' key={i}>
                <div onClick={() => navigate(`/downloads/${item.slug}`)} className='contributorImgBlock'>
                    {
                        !imgLoader && <img src={img} alt="" />
                    }
                    <img onLoad={loader} className='imgWidth' src={item?.watermarked_file?.file ?? image} alt="error" />

                </div>
                {
                    // imgLoader ?
                    <div className={item?.contributor ? 'contributorLogo' : 'd-none'} onClick={() => navigate('/profile', {
                        state: item?.contributor?.username
                    })}>
                        <img onLoad={loader} className='imgWidth' src={item?.contributor?.avatar ?? userLogo} alt="error" />
                        <h1>{item?.contributor?.first_name ? item?.contributor?.first_name : null}</h1>
                    </div>
                    // : <Skeleton variant="rectangular" width={210} height={118} />
                }
            </div>
        )
    })

    const imageItems = pichaData.length > 0 && pichaData?.map(function (item, i) {
        return (
            <div className='contributorCardWrap' key={i} >
                <div className='contributorImgBlock' onClick={() => navigate(`/downloads/${item.slug}`)}>
                    {
                        !imgLoader && <img src={img} alt="" />
                    }
                    <img onLoad={loader} className='imgWidth' src={item?.watermarked_file?.file ?? image} alt="error" />
                </div>
                <div className={item?.contributor ? 'contributorLogo' : 'd-none'} onClick={() => navigate('/profile', {
                    state: item?.contributor?.username
                })}>
                    <img className='imgWidth' src={item?.contributor?.avatar ?? userLogo} alt="error" />
                    <h1>{item?.contributor?.first_name ? item?.contributor?.first_name : null}</h1>
                </div>
            </div>
        )
    }) 

    return (
        pichaData.length > 0?
        <Masonry breakpointCols={breakpointColumnsObj} className="my-masonry-grid mt-50" columnClassName="my-masonry-grid_column">
            {
                (tabType === 'image' || "first") ? imageItems : videoItems
            }
        </Masonry>
        :<><div className='noRecord'><h3 className='nodDtaFound'>No record found</h3></div></>
    )
}

export default ImageCard