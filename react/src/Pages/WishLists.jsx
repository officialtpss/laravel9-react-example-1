import React, { useState, useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroller';
import instance from '../../services/apiServices/Api'
import SimpleBackdrop from '../../components/Backdrop';
import Storage from '../../services/locaol_storage/localStorage'
import TittleBanner from '../../components/TitleBanner';
import { Link } from 'react-router-dom';
import WishListCard from '../../components/WishListCard'
import { errorMessage } from '../../helpers/Message';

function WishLists() {

    const token = Storage.getToken("token");
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const header = { headers: { Authorization: `Bearer ${token}` } }
    const [page, setPage] = useState(1)
    const [hasMore, SetHasMore] = useState(false)

    useEffect(() => {
        getData()
        // eslint-disable-next-line
    }, [])

    const item = {
        title: "Wishlists",
        link: "/",
        breadCrumbs: "Wishlists"
    };
    const getData = () => {
        let data =
        {
            current_page: page ?? 1,
            per_page: 9,
            order_by: "newness_desc",
            is_public: "1"
        }
        instance.post("/wishlists", data, header
        ).then(res => {
            setLoading(false);
            SetHasMore(res.data.data.hasMorePages)
            setPage(res.data.data.nextPageNo)
            setData((preData) => {
                return [...new Set([...preData, ...res.data.data.items])];
            });
        }).catch(error => {
            errorMessage('Error!', error.response.data.message)
            setLoading(false)
        })
    }

    return (
        <>

            <div className="main-page-outer challenge-wrap min-h-empty wishlistPage-Outer">
                <TittleBanner item={item} />
                <div className="container">
                    <div className="wishlist-header">
                    <h1 className="section-heading m-0">Wish Lists</h1>
                    <Link className="btn primary-btn" to={`/wish-lists/create`}>Create New Wishlist</Link>
                    </div>
                    
                    <InfiniteScroll
                        pageStart={1}
                        loadMore={() => getData(page)}
                        hasMore={hasMore}
                        loader={<div className="loader" key={0}>Loading ...</div>}
                    >
                        {loading && <SimpleBackdrop />}
                        {
                            !loading &&
                            <div className="collection--multiimg">
                                {

                                    data.length > 0 ? data.map((item, i) =>

                                        <WishListCard item={item} key={i} />

                                    ) : <><h3 className="nodDtaFound">No Record Found</h3></>
                                }
                            </div>
                        }
                    </InfiniteScroll>
                </div>
            </div>
        </>
    )
}

export default WishLists