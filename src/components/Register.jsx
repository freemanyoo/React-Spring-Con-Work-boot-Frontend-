import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col,  Image as BootstrapImage  } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        mid: '',
        mpw: '',
        confirmPassword: '',
        email: '',
    });

    const [passwordMatch, setPasswordMatch] = useState(true);
    // 패스워드 일치 여부 체크
    const [isChecking, setIsChecking] = useState(false); // ✅ 중복 확인 요청 상태
    const [idCheckResult, setIdCheckResult] = useState(null); // ✅ 중복 체크 결과 메시지

    // ✅ 프로필 이미지 관련 상태 추가
    const [selectedFile, setSelectedFile] = useState(null);
    // 수정1, 이미지에서, 동영상 같이 되게끔추가
    //전
    // const [previewImage, setPreviewImage] = useState(null);
    // 후
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(''); // ✅ 파일 타입을 저장할 상태 (image | video)


    useEffect(() => {
        setPasswordMatch(formData.mpw === formData.confirmPassword);
    }, [formData.mpw, formData.confirmPassword]);

    // 수정2,
    // previewImage ->  previewUrl
    // ✅ [개선] 이미지 미리보기 메모리 누수 방지를 위한 useEffect 추가
    useEffect(() => {
        // 컴포넌트가 언마운트될 때 previewImage URL을 메모리에서 해제합니다.
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);
    // 입력 값 변경 핸들러
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        if (e.target.name === 'mid') {
            setIdCheckResult(null); // ✅ 아이디 입력 시 중복 검사 결과 초기화
        }
    };

    // 수정3
    // ✅ 파일 선택 핸들러 추가
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // setSelectedFile(file);
            // // 이미지 미리보기 URL 생성
            // const previewUrl = URL.createObjectURL(file);
            // setPreviewImage(previewUrl);
            // 후
            // 이전 미리보기 URL이 있다면 해제
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            setSelectedFile(file);

            // 파일 타입 확인
            if (file.type.startsWith('image/')) {
                setFileType('image');
            } else if (file.type.startsWith('video/')) {
                setFileType('video');
            } else {
                setFileType(''); // 지원하지 않는 파일 형식
            }

            // 새로운 미리보기 URL 생성
            const newPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl(newPreviewUrl);
        }
    };

    // 중복 아이디 체크
    const handleCheckId = async () => {
        if (!formData.mid.trim()) {
            alert('아이디를 입력해주세요.');
            return;
        }

        setIsChecking(true);
        try {
            const response = await axios.get(
                `http://localhost:8080/member/check-mid`,
                {
                    params: { mid: formData.mid },
                },
            );

            if (response.status === 200 && response.data === false) {
                setIdCheckResult({
                    available: true,
                    message: '사용 가능한 아이디입니다.',
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setIdCheckResult({ available: false, message: '중복된 아이디입니다.' });
            } else {
                console.error('아이디 확인 중 오류 발생:', error);
                setIdCheckResult({ available: false, message: '오류가 발생했습니다.' });
            }
        } finally {
            setIsChecking(false);
        }
    };

    // 회원가입 요청
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!passwordMatch) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!idCheckResult || !idCheckResult.available) {
            alert('아이디 중복 체크를 해주세요.');
            return;
        }

        // 1. FormData 객체 생성
        const registerData = new FormData();

        // 수정4, 기존 그대로 사용. (profileMedia 보류)
        // 2. 파일 데이터 추가
        if (selectedFile) {
            registerData.append('profileImage', selectedFile);
        }

        // 3. JSON 데이터를 문자열로 변환하여 추가
        // 서버에서는 이 'user' 파트를 JSON으로 파싱해야 합니다.
        registerData.append('user', new Blob([JSON.stringify({
            mid: formData.mid,
            mpw: formData.mpw,
            email: formData.email,
        })], {
            type: "application/json"
        }));

        try {
            // const response = await axios.post(
            //     'http://localhost:8080/member/register',
            //     formData,
            //     {
            //         headers: { 'Content-Type': 'application/json' },
            //     },
            // );

            // 4. FormData를 서버로 전송
            // axios가 자동으로 'multipart/form-data' 헤더를 설정해줍니다.
            await axios.post('http://localhost:8080/member/register', registerData);

            alert('회원가입 성공!');
            navigate('/login');
            alert('회원가입 성공!');
            navigate('/login'); // 로그인 페이지로 이동
        } catch (error) {
            alert('회원가입 실패');
            console.error(error);
        }
    };
    return (
        <Container className="mt-5">
            <h2 className="text-center">회원가입</h2>
            <Form onSubmit={handleSubmit} className="w-50 mx-auto">
                <Form.Group className="mb-3">
                    <Form.Label>아이디</Form.Label>
                    <Row>
                        <Col>
                            <Form.Control
                                type="text"
                                name="mid"
                                value={formData.mid}
                                onChange={handleChange}
                                required
                                placeholder="아이디 입력"
                                isInvalid={idCheckResult && !idCheckResult.available}
                                isValid={idCheckResult && idCheckResult.available}
                            />
                            <Form.Control.Feedback
                                type={idCheckResult?.available ? 'valid' : 'invalid'}
                            >
                                {idCheckResult?.message}
                            </Form.Control.Feedback>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="secondary"
                                onClick={handleCheckId}
                                disabled={isChecking}
                            >
                                {isChecking ? '확인 중...' : '중복 체크'}
                            </Button>
                        </Col>
                    </Row>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>비밀번호</Form.Label>
                    <Form.Control
                        type="password"
                        name="mpw"
                        value={formData.mpw}
                        onChange={handleChange}
                        required
                        placeholder="비밀번호 입력"
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>비밀번호 확인</Form.Label>
                    <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="비밀번호 확인"
                        isValid={passwordMatch && formData.confirmPassword.length > 0}
                        isInvalid={!passwordMatch && formData.confirmPassword.length > 0}
                    />
                    <Form.Control.Feedback type="invalid">
                        비밀번호가 일치하지 않습니다.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>이메일</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="이메일 입력"
                    />
                </Form.Group>

                {/*수정5*/}
                {/* ✅ 프로필 이미지 업로드 필드 추가 */}
                <Form.Group className="mb-3">
                    <Form.Label>프로필 이미지 또는 동영상</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*, video/*" // 이미지 파일만 선택 가능하도록 설정
                        onChange={handleFileChange}
                    />
                </Form.Group>

                {/*수정6*/}
                {/* ✅ 이미지 미리보기 영역 */}
                {/*{previewImage && (*/}
                {/*    <div className="text-center mb-3">*/}
                {/*        <BootstrapImage src={previewImage} thumbnail style={{ maxWidth: '200px' }} />*/}
                {/*    </div>*/}
                {/*)}*/}
                {/* ✅ 미디어 미리보기 영역 수정 */}
                {previewUrl && (
                    <div className="text-center mb-3" style={{ maxWidth: '300px', margin: 'auto' }}>
                        {fileType === 'image' && (
                            <BootstrapImage src={previewUrl} thumbnail style={{ width: '100%' }} />
                        )}
                        {fileType === 'video' && (
                            // ✅ video 태그를 사용하여 동영상 미리보기
                            <video src={previewUrl} controls autoPlay muted loop style={{ width: '100%' }}>
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>
                )}

                <Button variant="primary" type="submit" className="w-100">
                    가입하기
                </Button>
            </Form>
        </Container>
    );
};
export default Register;