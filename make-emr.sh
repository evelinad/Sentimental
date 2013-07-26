#!/bin/bash
rm ../sentimental.tgz && tar czvf ../sentimental.tgz ./parser/ ./src/ ./stanford-postagger/ ./build/ ./static/ && PYTHONPATH=. python src/doing_semantic_analysis_mrjob.py -v -r emr "s3://yelp-emr-dev/data/hackathon_dataset/hackathon_dataset_review000*" | tee emr-output
