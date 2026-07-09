from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_evaluation():
    response = client.post(
        "/api/evaluate",
        json={
            "prompt_version_id": "prompt-support-v3",
            "model": "gpt-4.1",
            "input": "Customer has duplicate billing and renewal risk.",
            "expected_answer": "Escalate to billing with urgent priority.",
        },
    )

    payload = response.json()
    assert response.status_code == 200
    assert payload["prompt_version_id"] == "prompt-support-v3"
    assert len(payload["metrics"]) == 3
