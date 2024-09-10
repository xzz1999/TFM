from flask import Flask, request, jsonify
from guardrails.hub import RestrictToTopic
from guardrails import Guard
import os

app = Flask(__name__)



@app.route('/validate', methods=['POST'])
def validate_text():
    os.environ['OPENAI_API_KEY'] = ''
    data = request.get_json()
    text = data.get('text', '')
    valid_topics = data.get('valid_topics', [])
    invalid_topics = data.get('invalid_topics', [])
    try:
        guard =Guard().use(
            RestrictToTopic(
                valid_topics=valid_topics,
                invalid_topics=invalid_topics,
                disable_classifier=True,
                disable_llm=False,
                on_fail="exception"
                )
                )
        guard.validate(text)
        return jsonify({"status": "success", "message": "Validation passed."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
