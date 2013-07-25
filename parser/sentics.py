import rdflib
from string import Template

class Sentics(object):

	def __init__(self):
		self.sentic_local = "senticnet2.rdf.xml"
		self.parsed_graph = rdflib.Graph().parse(self.sentic_local, format="xml")
		self.query_base = Template('PREFIX sentic: <http://sentic.net/api/> '\
			'SELECT ?pleasantness ?attention ?sensitivity ?aptitude '\
			'WHERE { '\
       			'?concept sentic:text "$concept"; '\
	   			'sentic:pleasantness ?pleasantness; '\
	   			'sentic:attention ?attention; '\
	   			'sentic:sensitivity ?sensitivity; '\
	   			'sentic:aptitude ?aptitude. '\
	   		'}')
		
	def lookup(self, concept):
		query_str = self.query_base.substitute(concept=concept)
		query = self.parsed_graph.query(str(query_str))
		if len(query) == 0: return None
		return dict((str(sentic), float(score)) for (sentic, score) in query._get_bindings()[0].iteritems())