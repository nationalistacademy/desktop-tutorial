import xml.sax

class Handler(xml.sax.ContentHandler):
    pass

try:
    xml.sax.parse('assignmentwaly.xml', Handler())
    print("XML parses perfectly!")
except Exception as e:
    print("Error:", e)
