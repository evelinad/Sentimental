from mrjob.job import MRJob
from parser.senticsparser import get_sentics_of_sentence
import simplejson
from nltk.tokenize import sent_tokenize
from sklearn.cluster import DBSCAN
from numpy import array

class SentimentAnalysisMRJob(MRJob):
	def mapper(self, _, review):
		review = simplejson.loads(review)
		sentics = []
		for sentence in sent_tokenize(review['text']):
			sentics.extend(get_sentics_of_sentence(sentence))
		if sentics:
			sentics_avg = []
			print sentics
			for key in ['sensitivity', 'attention', 'pleasantness', 'aptitude']:
				sentics_avg.append(sum([s_dict[key] for s_dict in sentics]) / float(len(sentics)))
			yield review['business_id'], sentics_avg
		else:
			print review

	def reducer(self, biz, sentics):
		labels = DBSCAN().fit_predict(array(sentics))
		n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
		result = []
		for cluster_id in range(n_clusters):
			cluster_data = [sentics[idx] for idx in range(len(labels)) if labels[idx] == cluster_id]
			sentics_avg = []
			for idx in range(4):
				sentics_avg.append(sum([data[idx] for data in cluster_data]) / float(len(cluster_data)))
			result.append(sentics_avg)
		yield biz, result


if __name__ == '__main__':
	SentimentAnalysisMRJob.run()
