'''
Creating directory structure for storing documents
'''
#!/usr/bin/python

# -*- coding: utf-8 -*-
import os
from google.cloud import datastore




def create_dir(sess_id, project_id):
    '''
    Makes a local directory structure
    param: sess_id - str - unique id for different users
    param: project_id - GCP Project id
    '''

    client = datastore.Client(project_id)
    query = client.query(kind='tagged-doc')
    results = list(query.fetch())
    for i, _ in enumerate(results):
        if not os.path.isdir(os.path.join(os.getcwd(), sess_id,
                                          results[i].get('classificationType'))):
            os.makedirs(os.path.join(os.getcwd(), sess_id,
                                     results[i].get('classificationType')))
            os.system("gsutil -m cp -r \'{}\' {}\/".format(
                results[i].get('documentPath'),
                os.path.join(os.getcwd(), sess_id, results[i].get
                             ('classificationType'))))
        else:
            os.system("gsutil -m cp -r \'{}\' {}\/".format(
                results[i].get('documentPath'), os.path.join(os.getcwd(),
                                                             sess_id,
                                                             results[i].get('classificationType'))))
    print 'Directory structure is DONE !'
    return os.path.join(os.getcwd(), sess_id)



