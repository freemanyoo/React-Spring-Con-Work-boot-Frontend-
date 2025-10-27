import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadImageSuccess } from '../../store/ai/aiSlice';
import axios from 'axios';

// ✅ Flask 서버의 기본 URL을 상수로 정의합니다.
const FLASK_SERVER_URL = 'http://localhost:5000';

const useYoloClassification = () => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.ai);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [result, setResult] = useState({});

    // ✅ 파일 선택 핸들러
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            // 새로운 파일 선택 시 이전 결과 초기화
            setDownloadUrl(null);
            setResult({});
        }
    };

    // ✅ API 에러 메시지 처리 함수
    const getErrorMessage = (error) => {
        return error.response?.data || error.message || '알 수 없는 오류 발생';
    };

    // ✅ 파일 업로드 핸들러
    const handleUpload = async () => {
        if (!file) return false; // ✅ false 반환하여 `handleUploadWithProcessing`에서 감지

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(
                'http://localhost:8080/api/ai/predict/4',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                    timeout: 120000, // ✅ 타임아웃을 120초(2분)로 넉넉하게 설정
                },
            );

            console.log('📌 서버 응답:', response.data);


            // ✅ 서버 응답에 'url'이 있는지 확인하고 전체 URL을 생성합니다.
            if (response.data && response.data.url) {
                const fullResultUrl = FLASK_SERVER_URL + response.data.url;
                console.log('📌 완성된 결과 URL:', fullResultUrl);

                // 완성된 URL을 미리보기와 다운로드 URL로 설정합니다.
                // 이 URL은 분석 '결과'를 보여줍니다.
                setPreview(fullResultUrl);
                setDownloadUrl(fullResultUrl);
            }

            dispatch(uploadImageSuccess(response.data));
            setResult(response.data);

            return true; // ✅ 명확하게 성공 시 `true` 반환
        } catch (error) {
            console.error('❌ 파일 업로드 오류:', getErrorMessage(error));
            alert(`❌ 파일 업로드 실패: ${getErrorMessage(error)}`);
            return false; // ✅ 실패 시 `false` 반환
        }
    };

    // ✅ 실제 파일 다운로드를 처리하는 핸들러
    const handleDownload = async () => {
        if (!downloadUrl) {
            alert('다운로드할 파일이 없습니다.');
            return;
        }

        try {
            // Axios를 사용해 파일 데이터를 blob 형태로 가져옵니다.
            const response = await axios.get(downloadUrl, {
                responseType: 'blob',
            });

            // 다운로드할 파일의 이름을 URL에서 추출합니다.
            const filename = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1);

            // Blob 데이터를 가리키는 URL을 생성합니다.
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // download 속성에 파일명 설정
            document.body.appendChild(link);
            link.click();

            // 다운로드 후 생성된 URL과 링크를 정리합니다.
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('❌ 다운로드 오류:', e);
            alert('파일을 다운로드하는 중 오류가 발생했습니다.');
        }
    };

    return {
        file,
        preview,
        downloadUrl,
        setDownloadUrl,
        result,
        setResult,
        error,
        loading,
        handleFileChange,
        handleUpload,
        handleDownload, // ✅ 다운로드 함수를 외부로 내보냅니다.
    };
};

export default useYoloClassification;