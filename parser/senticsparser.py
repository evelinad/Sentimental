#! /usr/bin/env python

import cPickle as pickle
import networkx as nx
import senticnet
import SenticParser

def get_sentics_of_sentence(sentence):
	G = nx.read_gpickle( "test.gpickle" )

	bigrams = []

	words = sentence.split()

	list_concepts = []
	conc = []

	to_add = ""

	for word in words:
		if ( word in G ):
			conc.append(word)
			to_add += word+" "
		elif( to_add != "" ):
			list_concepts.append(to_add[:-1])
			to_add = ""

	if( to_add != "" ):
		list_concepts.append(to_add[:-1])

	parserList = SenticParser.getOutputConcepts(sentence)

	list_concept = list( set(list_concepts) |	set(parserList) )

	list_concept = filter(bool, list_concept)

	list_concept = set(list(list_concepts))

	sn = senticnet.Senticnet()

	to_search = []


	for phrase in list_concepts:
		concepts = phrase.split()
		to_search = to_search + concepts
		for i in range(len(concepts) - 1):
			for j in range(i+1, len(concepts)):
				try:
					k = nx.dijkstra_path(G,concepts[i], concepts[j])
					if( len(k) == j-i+1 and k == concepts[i:j+1] ):
						to_search = list( set(to_search) - set(k) )
						word_to_add = "_".join(k)
						to_search.append( word_to_add )
				except:
					continue

	to_search = list( set(	to_search ) )

	sorted_by_length = sorted(to_search, key=lambda tup:len(tup.split("_")) )
	return [sn.sentics(concept) for concept in to_search]
