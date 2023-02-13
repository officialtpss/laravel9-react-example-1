import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faUser } from '@fortawesome/free-solid-svg-icons';
import { useFormik } from 'formik';
// import PropagateLoader from "react-spinners/PropagateLoader";
import { faImages } from '@fortawesome/free-regular-svg-icons';
import "react-multi-carousel/lib/styles.css";
import Carousel from "react-multi-carousel";
import instance from '../services/apiServices/Api';
import ImageCard from '../components/ImageCard';
import SimpleBackdrop from '../components/Backdrop';
import ContributorCard from '../components/ContributorCard';
import { useSelector } from 'react-redux';
import Storage from '../services/locaol_storage/localStorage';
import { toast } from 'react-toastify';
import { errorMessage } from '../helpers/Message';


const filterSearchTypeListing = [
  { type: "both", name: "All" },
  { type: "image", name: "Image" },
  { type: "video", name: "Video" },
  { type: "contributor", name: "Contributor" },
]

const filterSortList = [
  { type: "", name: "Select" },
  { type: "newness_asc", name: "Newest First" },
  { type: "newness_desc", name: "Oldest First" },
  { type: "title_asc", name: "Title (A-Z)" },
  { type: "title_desc", name: "Title (Z-A) " },
]

function SearchResult() {

  let { state } = useLocation();
  const [active, setActive] = useState("image");
  const [tabToggle, setTabToggle] = useState(state.type);
  const [imageData, SetImageData] = useState([]);
  const [collTags, setcollTags] = useState([])
  const isAuth = useSelector(item => item.isAuth.value)
  const token = Storage.getToken();
  const header = { headers: { Authorization: `Bearer ${token}` } }
  const navigate = useNavigate();
  const [count, setCount] = useState({
    image: 0,
    video: 0,
    contributor: 0
  })
  let [loading, setLoading] = useState(true);

  const [nextPage, setNextPage] = useState(0);

  const formik = useFormik({
    initialValues: {
      search_text: state?.search_text,
      type: state?.type,
      order_by: state?.order_by,
      current_page: 1,
      per_page: 20,
      category_slug: ""
    },

    onSubmit: (values) => {
      setLoading(true)
      if (values.type === "video") {
        setActive("video")
      }
      if (values.type !== "video") {
        setActive("image")
      }
      if (values.type === "contributor") {
        setActive("contributor")
      }
      const promise = new Promise((resolve, reject) => {
        resolve(getData(values))
      })
      promise.then(setTabToggle(values.type))
    }
  })

  useEffect(() => {
    getData(state, 'default')
    // eslint-disable-next-line    
  }, [])


  const getData = (searchApiData, type) => {

    let data = {
      type: searchApiData.type === "both" ? "image" : searchApiData.type,
      search_text: searchApiData.search_text,
      current_page: searchApiData.current_page,
      per_page: searchApiData.per_page,
      category_slug: searchApiData.category_slug,
      order_by: searchApiData.order_by
    }

    instance.post("search", data).then(res => {
      const { data } = res.data;
      if (data) {
        setLoading(false)
        setNextPage(data.nextPageNo);
        setcollTags(data.categories)
        setCount({ image: data.totalImages, video: data.totalVideos, contributor: data.totalContributors })
        SetImageData((preData) => {
          return (type === 'loadMore') ?
            [...new Set([...preData, ...data.search_records])] :
            [...new Set(data.search_records)]
        });
      }
    })
  }

  const LoadMore = () => {
    if (nextPage > 1) {
      state = { ...state, type: active, current_page: nextPage, search_text: formik.values.search_text };
      getData(state, 'loadMore')
    } else {
      console.log('No more data to show');
    }
  };

  const tabSwitch = (e, tab) => {
    setLoading(true)
    e.preventDefault();
    state = { ...state, type: tab, search_text: formik.values.search_text };
    getData(state, 'default');
    setActive(tab);
  }

  const ToggleDropdowns = (value) => {
    if (value === "open-filter-variation") {
      document.getElementById("open-filter-variation").classList.toggle("open-filter-variation")
      document.getElementById("open-filter-variation2").classList.remove("open-filter-variation")
    } else {
      document.getElementById("open-filter-variation2").classList.toggle("open-filter-variation")
      document.getElementById("open-filter-variation").classList.remove("open-filter-variation")
    }
  }

  const followContributor = (id, value) => {
    setLoading(true)
    const searchData = {
      type: "contributor",
      search_text: state?.search_text
    }
    if (isAuth) {
      instance.post('/follow-user', {
        user_id: id,
        flag: value ? 0 : 1
      }, header).then((res) => {
        setLoading(false)
        if (res.data.response === 200) {
          toast.success(res.data.message, {
            autoClose: 1000,
          });
          getData(searchData, 'default');
        }
      }).catch(error => {
        console.log("Error:", error);
        setLoading(false)
        errorMessage("Error", "Something Went Wrong")
      })
    }
    else {
      setLoading(false)
      errorMessage("Error", "Login To Continue").then(() => {
        navigate("/login")
      })
    }

  }

  return (
    <>
      {loading && <SimpleBackdrop />}

      {/* <!-- Fashion section --> */}
      <section className="faishon">
        <div className="container">
          <div className="collection--main-inside">
            <div className="">
              <Carousel
                // autoPlay={true}
                additionalTransfrom={0}
                arrows
                autoPlaySpeed={1000}
                centerMode={false}
                className="collection--main-btns"
                containerclassName="container-with-dots "
                dotListclassName=""
                draggable
                focusOnSelect={false}
                infinite
                itemclassName=""
                keyBoardControl
                minimumTouchDrag={80}
                pauseOnHover
                renderArrowsWhenDisabled={false}
                renderButtonGroupOutside={true}
                renderDotsOutside={false}
                responsive={{
                  desktop: {
                    breakpoint: {
                      max: 3000,
                      min: 1024
                    },
                    items: 6,
                    partialVisibilityGutter: 40
                  },
                  mobile: {
                    breakpoint: {
                      max: 464,
                      min: 0
                    },
                    items: 1,
                    partialVisibilityGutter: 30
                  },
                  tablet: {
                    breakpoint: {
                      max: 1024,
                      min: 464
                    },
                    items: 2,
                    partialVisibilityGutter: 30
                  }
                }}
                rewind={false}
                rewindWithAnimation={false}
                rtl={false}
                shouldResetAutoplay
                showDots={false}
                sliderclassName=""
                slidesToSlide={1}
                swipeable
              >
                {
                  collTags.map((item, i) =>
                    <div key={i} className="collection-tags text-center">
                      <Link to={`/downloads/category/${item.slug}`} state={{ name: item.name }} className="collection-multi-btn" key={i}>{item.name}</Link>
                    </div>
                  )
                }
              </Carousel>
            </div>
          </div>
          <div className="faishonPhotos-main">
            <h2 className='section-heading left-text'> Photos/Videos</h2>
            <div className="faishonPhotos-content">
              <div className="faishonPhotos-btns-filter">
                <div className="faishonPhotos-buttons">
                  <div style={{ display: `${["video", "contributor"].includes(tabToggle) ? "none" : ""}` }} className={active === "image" ? "tab-links active" : "tab-links"} onClick={(e) => tabSwitch(e, 'image')}>
                    <FontAwesomeIcon icon={faImages} className="icon" />{`Photos-${count.image}`}
                  </div>
                  <div style={{ display: `${["image", "contributor"].includes(tabToggle) ? "none" : ""}` }} className={active === "video" ? "tab-links active" : "tab-links"} onClick={(e) => tabSwitch(e, 'video')}>
                    <FontAwesomeIcon icon={faFilm} className="icon" />{`Videos-${count.video}`}
                  </div>
                  <div style={{ display: `${["image", "video"].includes(tabToggle) ? "none" : ""}` }} className={active === "contributor" ? "tab-links active" : "tab-links"} onClick={(e) => tabSwitch(e, 'contributor')}>
                    <FontAwesomeIcon icon={faUser} className="icon" />{`Contributor-${count.contributor}`}
                  </div>
                </div>
                <div className="faishonPhotos-filter">
                  <button
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      document.getElementById("search-result-filter").classList.toggle("open-filter")
                    }}
                    className='filter-btn'>
                    <svg xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24" fill="none">
                      <path
                        d="M14 5C14 3.89543 13.1046 3 12 3C10.8954 
                                                3 10 3.89543 10 5M14 5C14 6.10457 13.1046 7 
                                                12 7C10.8954 7 10 6.10457 10 5M14 5H20M10 5L4 
                                                5M16 12C16 13.1046 16.8954 14 18 14C19.1046 14
                                                 20 13.1046 20 12C20 10.8954 19.1046 10 18 
                                                 10C16.8954 10 16 10.8954 16 12ZM16 12H4M8 
                                                 19C8 17.8954 7.10457 17 6 17C4.89543 17 4 
                                                 17.8954 4 19C4 20.1046 4.89543 21 6 21C7.10457 
                                                 21 8 20.1046 8 19ZM8 19H20"
                        stroke="#001A72"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Filter
                  </button>
                </div>
                <div id="search-result-filter" className="filter-form-outer ">
                  <form onSubmit={formik.handleSubmit} className="filter-form-inner-wrap">
                    <div className="field-outer m-3-full-width">
                      <label className="input-label">Search</label>
                      <input
                        {...formik.getFieldProps("search_text")}
                        className="inputField"
                        name="search_text"
                        type="text"
                        placeholder="search" />
                    </div>
                    <div onClick={() => ToggleDropdowns("open-filter-variation")} className="field-outer m-3-full-width">
                      <label className="input-label">media</label>
                      <div id="open-filter-variation" className="search-variation">
                        <div className="inputField">{filterSearchTypeListing.find(item => item.type === formik.values.type).name}
                          <svg xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512">
                            <path
                              d="M201.4 374.6c12.5 12.5 32.8 12.5 
                                                    45.3 0l160-160c12.5-12.5 12.5-32.8 
                                                    0-45.3s-32.8-12.5-45.3 0L224 306.7 
                                                    86.6 169.4c-12.5-12.5-32.8-12.5-45.3 
                                                    0s-12.5 32.8 0 45.3l160 160z" />
                          </svg>
                        </div>
                        <div className="search-variation-submenu">
                          <ul className="search-variation-list">

                            {
                              filterSearchTypeListing.map((item, i) => {
                                return (
                                  <li onClick={() => formik.setFieldValue("type", item.type)} key={i} >
                                    {item.name}
                                  </li>
                                )
                              })
                            }
                          </ul>
                        </div>

                      </div>
                    </div>
                    <div onClick={() => ToggleDropdowns("open-filter-variation2")} className="field-outer m-3-full-width">
                      <label className="input-label">Relevant</label>
                      <div id="open-filter-variation2" className="search-variation">
                        <div className="inputField">{filterSortList.find(item => item.type === formik.values.order_by).name}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512">
                            <path
                              d="M201.4 374.6c12.5 12.5 32.8 12.5 
                                                    45.3 0l160-160c12.5-12.5 12.5-32.8
                                                     0-45.3s-32.8-12.5-45.3 0L224 306.7 
                                                     86.6 169.4c-12.5-12.5-32.8-12.5-45.3 
                                                     0s-12.5 32.8 0 45.3l160 160z" />
                          </svg>
                        </div>
                        <div className="search-variation-submenu">
                          <ul className="search-variation-list">

                            {
                              filterSortList.map((item, i) => {
                                return (
                                  <li onClick={() => formik.setFieldValue("order_by", item.type)} key={i} >
                                    {item.name}
                                  </li>

                                )
                              })
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="field-outer text-center filter-actionOuter">

                      <button
                        type='submit'
                        className="icon-btn search-filter">
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="fas"
                          data-icon="magnifying-glass"
                          className="svg-inline--fa fa-magnifying-glass search_icon"
                          role="img"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512">
                          <path
                            fill="currentColor"
                            d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 
                                                     457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 
                                                     12.5-45.3 0L330.7 376c-34.4 25.2-76.8 
                                                     40-122.7 40C93.1 416 0 322.9 0 208S93.1 
                                                     0 208 0S416 93.1 416 208zM208 352c79.5 
                                                     0 144-64.5 144-144s-64.5-144-144-144S64 
                                                     128.5 64 208s64.5 144 144 144z">
                          </path>
                        </svg>
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          formik.setFieldValue("search_text", "")
                          formik.setFieldValue("type", "both")
                          formik.setFieldValue("order_by", "")
                        }}
                        className="icon-btn reset-filter">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512">
                          <path
                            d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 
                                                    183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 
                                                    14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 
                                                    24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 
                                                    5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 
                                                    122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 
                                                    40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 
                                                    37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 
                                                    14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 
                                                    86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 
                                                    52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 
                                                    2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 
                                                    62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 
                                                    5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 
                                                    0-24 10.7-24 24z" />
                        </svg>
                      </button>
                    </div>

                  </form>
                </div>
              </div>

              <div id="first" className="tab-content show">
                <section className="pichastock">

                  <div className="container">
                    {
                      active === "image" || active === "video" ?
                        !loading && imageData.length > 0 ? <ImageCard Data={{ HasMore: true, PageNbr: 1, pichaData: imageData, tabType: active, loading: false }} /> : !loading && <h3 className='nodDtaFound'>No Data Found</h3>
                        : !loading && imageData.length > 0 ? <ContributorCard Data={{ pichaData: imageData, follow: followContributor, }} /> : !loading && <h3 className='nodDtaFound'>No Data Found</h3>
                    }
                  </div>

                </section>
              </div>
              <div className="pichastock-btn-outer text-center">
                {
                  nextPage > 0 && <button onClick={() => LoadMore()} className="btn primary-btn pichastock--btn mt-50 mb-50">Load More</button>
                }


              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default SearchResult