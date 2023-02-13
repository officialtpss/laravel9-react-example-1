import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import { errorMessage } from '../helpers/Message';
import instance from '../services/apiServices/Api'
import Storage from '../services/locaol_storage/localStorage';
import SimpleBackdrop from './Backdrop';
import * as Yup from 'yup'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import img from '../assets/imagePlaceholder.jpg'




function PreferencePopUp() {
    const Step = Storage.getPreferenceStep();
    const token = Storage.getToken();
    const header = { headers: { Authorization: `Bearer ${token}` } }
    const userData = Storage.getUserData();
    const [popularData, setPopularData] = useState({ popular_contributors: [], popular_tags: [] });
    const [selectedTags, setSelectedTags] = useState([]);
    const followList = popularData?.popular_contributors.filter((item) => item.is_followed === true)
    const [loading, setLoading] = useState(false);
    const isAuth = useSelector(item => item.isAuth.value)
    const navigate = useNavigate();



    useEffect(() => {
        Step !== null && getpopularData()
        // eslint-disable-next-line   
    }, [])

    const formik = useFormik({
        initialValues: {
            name: "",
            email: ""
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is Required"),
            email: Yup.string().email("Invalid Email").required('Email is Required'),
        }),

        onSubmit: (values) => {
            setLoading(true);
            if (Step === "invite_friends") {
                instance.post('/invite_friend', { email: values?.email, name: values?.name }, header).then(res => {
                    setLoading(false)
                    if (res?.status === 200) {
                        formik.resetForm()
                        UpdateStep('follow_contributors')
                    }
                    else {
                        toast.error("Something went wrong", {
                            position: "top-right",
                            autoClose: 1000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                        })
                    }
                }).catch((error) => {
                    setLoading(false)
                    toast.error(error.response.data.message, {
                        autoClose: 1000,
                    })
                })
            }
        }
    });

    const selectCheckbox = (e, id) => {
        const { checked } = e.target;
        let value = selectedTags
        if (checked) {
            document.getElementById(id).classList.add('selected-img')
            setSelectedTags([...value, id]);
        }
        if (!checked) {
            document.getElementById(id).classList.remove('selected-img')
            setSelectedTags(value.filter(item => item !== id));
        }
    }

    const UpdateStep = (step) => {
        setLoading(true)
        const data = { first_name: userData.first_name, last_name: userData.last_name, current_step: step }
        instance.post('/user', data, header).then((res) => {
            setLoading(false)
            toast.success(res.data.message)
            getpopularData()
        }).catch((err) => {
            setLoading(false)
            errorMessage('Error', err.response.data.message)
        })
    }

    const updateTags = () => {
        setLoading(true)
        if (selectedTags.length > 0) {
            instance.post('/tags/like', { tags: selectedTags }, header).then(res => {
                setLoading(false)
                if (res?.status === 200) {
                    formik.resetForm()
                    UpdateStep('invite_friends')
                }
                else {
                    toast.error("Something went wrong")
                }
            }).catch((error) => {
                setLoading(false)
                toast.error(error.response.data.message, {
                    autoClose: 1000,
                })
            })
        }
    }

    const getpopularData = () => {
        instance.get('/popular-tags-contributors', header).then((res) => {
            setPopularData({ popular_contributors: res.data.data.popular_contributors, popular_tags: res.data.data.popular_tags })
            Storage.SetPreferenceStep(res.data.data.user_info.current_step)
        }).catch((Err) => {
            errorMessage("Error", Err.response.data.message)
        })
    }

    const followContributor = (id, value) => {
        setLoading(true)
        if (isAuth) {
            instance.post('/follow-user', {
                user_id: id,
                flag: value ? 0 : 1
            }, header).then((res) => {
                setLoading(false)
                if (res.data.response === 200) {
                    toast.success(res.data.message, {
                        autoClose: 1000,
                    })
                    getpopularData();
                }
            }).catch(error => {
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

    const UpdateContributors = () => {
        if (followList.length > 0) {
            UpdateStep(null)
        }
    }

    return (
        <>


            {
                token && Step !== null &&

                <div className="pichaPopupOuter">
                    {
                        loading && <SimpleBackdrop />
                    }
                    <ToastContainer />
                    <div className="pichaPopupOuterContent">
                        <div className={Step === "tag_likes" ? "contributerPrefrence min-h-empty" : "contributerPrefrence hide"} key="tag_likes">
                            <div className="prefrenceImage">
                                <img src="https://pichastock-v2-dev-client.s3.amazonaws.com/2402/resized/images/815-w-EUAmzl5H8pxGoiMg_1674498753.jpg" alt="" />
                            </div>
                            <div className="prefrencecontentWrap">
                                <div className="d-flex justify-content-between">
                                    <h2>Popular Category</h2>
                                    <button type='button' className="btn secondary-btn skipbtn" onClick={() => UpdateStep('invite_friends')}>Skip</button>
                                </div>
                                <div className="prefrencecontentrow">
                                    {
                                        popularData?.popular_tags?.length > 0 && popularData.popular_tags.map((item, i) =>
                                            <div className="prefrencecontentColumn" id={item.id} key={item.id}>
                                                {item.name}
                                                <input
                                                    type="checkbox"
                                                    name={item.name}
                                                    value={item.id}
                                                    onChange={(e) => selectCheckbox(e, item.id)}
                                                    checked={selectedTags.includes(item.id)} />
                                            </div>
                                        )
                                    }
                                </div>
                                {selectedTags.length <= 0 && < p >* Select atleast one category</p>}
                                <div className="prefbtn-wrap">
                                    <button type='button' className="btn primary-btn prefbtn" onClick={updateTags} >Continue</button>
                                </div>
                            </div>
                        </div>
                        <div className={Step === "invite_friends" ? "contributerPrefrence min-h-empty" : "contributerPrefrence hide"} key="invite_friends">
                            <div className="prefrenceImage">
                                <img src="https://pichastock-v2-dev-client.s3.amazonaws.com/2083/resized/images/815-w-nGEUao8BrDYsDBV6_1674474243.jpg" alt="" />
                            </div>
                            <div className="prefrencecontentWrap">
                                <div className="d-flex justify-content-between">
                                    <h2>Invite Friends</h2>
                                    <button type='button' className="btn secondary-btn skipbtn" onClick={() => UpdateStep('follow_contributors')}>Skip</button>
                                </div>
                                <form action="#" onSubmit={formik.handleSubmit}>
                                    <div className="prefrencecontentrow mx-15">

                                        <div className="full-width py-7">
                                            <input className='input-field'
                                                type="text"
                                                name='name'
                                                placeholder="Name"
                                                {...formik.getFieldProps("name")} />
                                            {formik.errors.name && formik.touched.name ? (
                                                <div className='validation-error'>{formik.errors.name}</div>
                                            ) : null}
                                        </div>
                                        <div className="full-width py-7">
                                            <input className='input-field'
                                                type="email"
                                                name='email'
                                                placeholder="Email"
                                                {...formik.getFieldProps("email")} />
                                            {formik.errors.email && formik.touched.email ? (
                                                <div className='validation-error'>{formik.errors.email}</div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="prefbtn-wrap">
                                        <button type='submit' className="btn primary-btn invitebtn">Continue</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className={Step === "follow_contributors" ? "contributerPrefrence min-h-empty" : "contributerPrefrence hide"} key="follow_contributors">
                            <div className="prefrenceImage">
                                <img src="https://pichastock-v2-dev-client.s3.amazonaws.com/5752/resized/images/815-w-lc3xrj2oXB5JZPX0_1674514900.jpg" alt="" />
                            </div>
                            <div className="prefrencecontentWrap">
                                <div className="d-flex justify-content-between">
                                    <h2>Popular Contributors</h2>
                                    <button type='button' className="btn secondary-btn skipbtn" onClick={() => UpdateStep(null)}>Skip</button>
                                </div>
                                <div className="prefrencecontentrow popupcontributorList">
                                    {
                                        popularData?.popular_contributors?.length > 0 && popularData.popular_contributors.map((item, i) =>

                                            <div className="popupcontributorInner">
                                                <div className="popupcontributoruser">

                                                    <span>
                                                        <img src={item?.avatar ?? img} alt="" className='prefrenceImage' />
                                                    </span>

                                                    <h3>{item?.first_name}</h3>
                                                    <p>{item?.username}</p>

                                                </div>

                                                <button className='btn primary-btn p-0' onClick={() => followContributor(item?.id, item?.is_followed)} >{item?.is_followed ? "Following" : "Follow"}</button>
                                            </div>

                                        )
                                    }
                                </div>
                                {followList.length <= 0 && < p >* Follow atleast one contributor</p>}
                                <div className="prefbtn-wrap">
                                    <button type='button' className="btn primary-btn prefrencebtn" onClick={UpdateContributors} >Continue</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div >
            }

        </>
    )
}

export default PreferencePopUp